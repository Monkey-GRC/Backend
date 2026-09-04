/**
 * Reescribe `mnk_cis_check_translations` (central) para los 184 check_ids
 * usados en el catálogo SOC 2, en español CLARO — no una traducción literal
 * del benchmark CIS de Wazuh (que es correcta pero muy técnica), sino
 * explicado en términos que una persona de negocio pueda entender:
 *
 *   - title_es: nombre corto y llano del check.
 *   - description_es: "Qué evalúa" — una frase simple.
 *   - rationale_es: "Por qué importa" — en términos de riesgo de negocio.
 *   - remediation_es: "Cómo remediar" — pasos claros; el detalle técnico
 *     (comando/archivo) va al final, no primero.
 *
 * De los 184, 128 ya tenían fila (traducción técnica literal, de una fase
 * anterior) y 56 no tenían ninguna. Este script REEMPLAZA las 184 por
 * completo — no es un parche sobre lo viejo.
 *
 * Uso:
 *   npx tsx scripts/rewrite-check-translations.ts            # dry-run
 *   npx tsx scripts/rewrite-check-translations.ts --apply
 */
import 'dotenv/config';
import { Pool } from 'pg';

type Translation = { title_es: string; description_es: string; rationale_es: string; remediation_es: string };

const t = (title_es: string, description_es: string, rationale_es: string, remediation_es: string): Translation =>
  ({ title_es, description_es, rationale_es, remediation_es });

// ---------------------------------------------------------------------------
// Familia: partición separada para una carpeta
// ---------------------------------------------------------------------------
function fPartition(path: string): Translation {
  return t(
    `Partición separada para ${path}`,
    `Confirma que ${path} está en su propia partición de disco, separada del sistema operativo principal.`,
    `Si ${path} comparte partición con el sistema, algo que llene esa carpeta sin control (archivos temporales, registros que crecen de más) puede dejar sin espacio a todo el servidor y tumbar servicios que no tienen nada que ver. Tenerla aislada limita el daño a esa sola partición.`,
    `Requiere crear una partición o volumen dedicado para ${path} y montarlo ahí — normalmente implica reparticionar el disco o agregar un volumen nuevo (editando /etc/fstab). Es un cambio que conviene planear con infraestructura, no aplicar en caliente sobre un servidor en producción.`,
  );
}

// ---------------------------------------------------------------------------
// Familia: opción de montaje (nodev/nosuid/noexec) sobre una partición
// ---------------------------------------------------------------------------
const MOUNT_OPTION_WHY: Record<string, string> = {
  nodev: 'evita que alguien cree ahí archivos de dispositivo que podrían usarse para saltarse controles de acceso al hardware del servidor',
  nosuid: 'evita que un archivo ejecutable con privilegios elevados (setuid) colocado ahí pueda usarse para escalar permisos si alguien logra escribir en esa carpeta',
  noexec: 'impide ejecutar programas directamente desde esa carpeta — importante porque son carpetas donde cualquier usuario o proceso puede dejar archivos temporales, y sin esto alguien podría dejar ahí un programa malicioso y correrlo',
};
function fMountOption(path: string, opt: 'nodev' | 'nosuid' | 'noexec'): Translation {
  return t(
    `Opción ${opt} en la partición ${path}`,
    `Confirma que la partición ${path} está montada con la opción "${opt}", que restringe lo que se puede ejecutar o crear ahí.`,
    `Esta opción ${MOUNT_OPTION_WHY[opt]}.`,
    `Editar /etc/fstab y agregar la opción "${opt}" en las opciones de montaje de esa partición, y remontarla (mount -o remount ${path}) para que el cambio tome efecto sin reiniciar el servidor.`,
  );
}

// ---------------------------------------------------------------------------
// Familia: servicio/paquete que NO debe estar en uso
// ---------------------------------------------------------------------------
function fServiceDisabled(label: string, service: string): Translation {
  return t(
    `${label} deshabilitado`,
    `Confirma que el servidor no tiene instalado o corriendo ${label.toLowerCase()}.`,
    `Cada servicio activo es una puerta de entrada adicional. Si este servidor no cumple ese rol, tenerlo corriendo solo agrega riesgo sin ningún beneficio real.`,
    `Desinstalar el paquete correspondiente o, si debe quedar instalado por alguna dependencia, deshabilitarlo y detenerlo (systemctl disable --now ${service}).`,
  );
}

// ---------------------------------------------------------------------------
// Familia: servicio que SÍ debe estar habilitado
// ---------------------------------------------------------------------------
function fServiceEnabled(label: string, service: string, why: string): Translation {
  return t(
    `${label} habilitado`,
    `Confirma que ${label.toLowerCase()} está instalado, habilitado y corriendo.`,
    why,
    `Habilitar e iniciar el servicio: systemctl enable --now ${service}.`,
  );
}

// ---------------------------------------------------------------------------
// Familia: política de firewall "denegar por defecto"
// ---------------------------------------------------------------------------
function fFirewallDeny(tool: string): Translation {
  return t(
    `Firewall (${tool}) deniega por defecto`,
    `Confirma que la política por defecto del firewall (${tool}) es bloquear todo el tráfico que no esté explícitamente permitido.`,
    `Es la diferencia entre "permitir todo salvo lo bloqueado" (inseguro: basta con olvidar bloquear algo para quedar expuesto) y "denegar todo salvo lo permitido" (seguro: un error de configuración deja algo sin acceso, no expuesto).`,
    `Configurar la política por defecto de ${tool} en modo denegar/drop, y agregar reglas explícitas solo para el tráfico que sí debe pasar.`,
  );
}

// ---------------------------------------------------------------------------
// Familia: SSH — configuración de sshd_config
// ---------------------------------------------------------------------------
function fSsh(title: string, description: string, rationale: string, remediation: string): Translation {
  return t(title, description, rationale, `${remediation} (se ajusta en /etc/ssh/sshd_config).`);
}

// ---------------------------------------------------------------------------
// Familia: permisos de archivos del sistema
// ---------------------------------------------------------------------------
function fPermissions(file: string, why: string, mode: string): Translation {
  return t(
    `Permisos de ${file}`,
    `Confirma que ${file} tiene permisos que impiden que cualquier usuario lo lea o modifique sin autorización.`,
    why,
    `Ajustar permisos y dueño de ${file} (chmod ${mode}, dueño root).`,
  );
}

// ---------------------------------------------------------------------------
// Familia: política de calidad de contraseña
// ---------------------------------------------------------------------------
function fPasswordQuality(title: string, description: string): Translation {
  return t(
    title,
    description,
    'Las contraseñas cortas, simples o reutilizadas son la causa más común de cuentas comprometidas — esta regla evita que alguien elija una contraseña fácil de adivinar o de romper por fuerza bruta.',
    'Ajustar el módulo de calidad de contraseñas de PAM (pam_pwquality) con el parámetro correspondiente en /etc/security/pwquality.conf.',
  );
}

// ---------------------------------------------------------------------------
// Familia: vigencia de contraseña (login.defs)
// ---------------------------------------------------------------------------
function fPasswordAging(title: string, description: string): Translation {
  return t(
    title,
    description,
    'Una contraseña que nunca expira, o que se puede volver a cambiar de inmediato (facilitando "cambiarla y volverla a poner igual"), reduce el valor de tener una política de rotación en primer lugar.',
    'Ajustar los parámetros correspondientes en /etc/login.defs (PASS_MAX_DAYS, PASS_MIN_DAYS, PASS_WARN_AGE) y con "chage" para las cuentas ya existentes.',
  );
}

// ---------------------------------------------------------------------------
// Familia: reglas de auditoría (auditd) sobre eventos que modifican algo
// ---------------------------------------------------------------------------
function fAuditEvent(what: string, why: string): Translation {
  return t(
    `Auditoría: cambios en ${what}`,
    `Confirma que auditd está configurado para registrar cada vez que se modifica ${what} en el servidor.`,
    why,
    'Agregar la regla correspondiente al archivo de reglas de auditd (/etc/audit/rules.d/) y recargarlas (augenrules --load).',
  );
}

// ---------------------------------------------------------------------------
// Familia: permisos/dueño de archivos y binarios de auditoría
// ---------------------------------------------------------------------------
function fAuditFilePerm(what: string): Translation {
  return t(
    `Protección de ${what} de auditoría`,
    `Confirma que ${what} de auditoría tienen los permisos y dueño correctos, restringiendo quién puede leerlos o modificarlos.`,
    'Si cualquier usuario pudiera leer o alterar estos archivos, podría manipular qué se audita o borrar evidencia sin que quede registro de que lo hizo.',
    'Ajustar permisos y dueño según el benchmark de CIS (normalmente acceso exclusivo para root).',
  );
}

const TRANSLATIONS: Record<string, Translation> = {
  // --- Particiones separadas ---
  '19506': fPartition('/tmp'),
  '19509': fPartition('/var'),
  '19510': fPartition('/var/tmp'),
  '19514': fPartition('/var/log'),
  '19515': fPartition('/var/log/audit'),
  '28500': fPartition('/tmp'),
  '28504': fPartition('/var'),
  '28507': fPartition('/var/tmp'),
  '28511': fPartition('/var/log'),
  '28515': fPartition('/var/log/audit'),
  '28519': fPartition('/home'),
  '28707': fPartition('/dev/shm'),

  // --- Opciones de montaje ---
  '19507': fMountOption('/tmp', 'nodev'),
  '19508': fMountOption('/tmp', 'nosuid'),
  '19511': fMountOption('/var/tmp', 'nodev'),
  '19512': fMountOption('/var/tmp', 'nosuid'),
  '19513': fMountOption('/var/tmp', 'noexec'),
  '28501': fMountOption('/tmp', 'nodev'),
  '28502': fMountOption('/tmp', 'noexec'),
  '28503': fMountOption('/tmp', 'nosuid'),
  '28505': fMountOption('/var', 'nodev'),
  '28506': fMountOption('/var', 'nosuid'),
  '28508': fMountOption('/var/tmp', 'noexec'),
  '28509': fMountOption('/var/tmp', 'nosuid'),
  '28510': fMountOption('/var/tmp', 'nodev'),
  '28512': fMountOption('/var/log', 'nodev'),
  '28513': fMountOption('/var/log', 'noexec'),
  '28514': fMountOption('/var/log', 'nosuid'),
  '28516': fMountOption('/var/log/audit', 'noexec'),
  '28517': fMountOption('/var/log/audit', 'nodev'),
  '28518': fMountOption('/var/log/audit', 'nosuid'),
  '28520': fMountOption('/home', 'nodev'),
  '28521': fMountOption('/home', 'nosuid'),
  '28522': fMountOption('/dev/shm', 'nodev'),
  '28523': fMountOption('/dev/shm', 'noexec'),
  '28524': fMountOption('/dev/shm', 'nosuid'),

  // --- Filesystems antiguos deshabilitados ---
  '19500': t(
    'Filesystem cramfs deshabilitado',
    'Confirma que el sistema no permite montar el tipo de sistema de archivos "cramfs", que no se usa en un servidor moderno.',
    'Son formatos antiguos y poco mantenidos — dejarlos disponibles amplía innecesariamente la superficie de ataque (por ejemplo, si alguien conecta un medio externo con ese formato).',
    'Agregar una regla en /etc/modprobe.d/ que bloquee la carga del módulo cramfs del kernel.',
  ),
  '19501': t(
    'Filesystem freevxfs deshabilitado',
    'Confirma que el sistema no permite montar el tipo de sistema de archivos "freevxfs", que no se usa en un servidor moderno.',
    'Son formatos antiguos y poco mantenidos — dejarlos disponibles amplía innecesariamente la superficie de ataque.',
    'Agregar una regla en /etc/modprobe.d/ que bloquee la carga del módulo freevxfs del kernel.',
  ),

  // --- Servicios que no deben estar en uso ---
  '19560': fServiceDisabled('El entorno gráfico (X Window)', 'gdm o el paquete de X Window instalado'),
  '28525': fServiceDisabled('El servicio autofs', 'autofs'),
  '28531': t(
    'Reporte automático de errores deshabilitado',
    'Confirma que el sistema no envía automáticamente reportes de errores a servidores externos.',
    'Esos reportes pueden incluir información sensible del sistema o de memoria en el momento del error, y salen hacia un tercero sin control de la empresa.',
    'Deshabilitar el servicio de reporte de errores (apport/whoopsie en Ubuntu).',
  ),
  '28551': fServiceDisabled('El servidor de X Window', 'xserver-xorg u otro paquete de servidor gráfico'),
  '28552': fServiceDisabled('El servicio Avahi (descubrimiento de red)', 'avahi-daemon'),
  '28553': fServiceDisabled('El servicio de impresión (CUPS)', 'cups'),
  '28554': fServiceDisabled('El servicio de DHCP', 'isc-dhcp-server'),
  '28555': fServiceDisabled('El servicio LDAP', 'slapd'),
  '28556': fServiceDisabled('El servicio de archivos de red (NFS)', 'nfs-server'),
  '28557': fServiceDisabled('El servicio de DNS', 'bind9 o el servidor DNS instalado'),
  '28558': fServiceDisabled('El servicio de FTP', 'vsftpd u otro servidor FTP'),
  '28559': fServiceDisabled('El servidor web', 'apache2/nginx (si este servidor no debe servir web)'),
  '28560': fServiceDisabled('El servicio de acceso a correo (IMAP/POP3)', 'dovecot u otro servidor de mensajería'),
  '28561': fServiceDisabled('El servicio de archivos Samba', 'smbd'),
  '28562': fServiceDisabled('El servicio de proxy web', 'squid u otro proxy'),
  '28563': fServiceDisabled('El servicio SNMP', 'snmpd'),
  '28564': fServiceDisabled('El servicio NIS', 'nis'),
  '28566': fServiceDisabled('El servicio rsync como demonio', 'rsync'),
  '28572': fServiceDisabled('El servicio rpcbind', 'rpcbind'),
  '28615': fServiceDisabled('El envío remoto de journald sin cifrar', 'systemd-journal-remote'),
  '28708': fServiceDisabled('El gestor gráfico de inicio de sesión (GDM)', 'gdm3'),
  '28709': fServiceDisabled('El servicio dnsmasq', 'dnsmasq'),
  '28710': fServiceDisabled('El servicio TFTP', 'tftpd'),
  '28711': fServiceDisabled('El servicio xinetd', 'xinetd'),
  '28714': fServiceDisabled('El servicio Bluetooth', 'bluetooth'),

  // --- Servicios que sí deben estar habilitados ---
  '19608': fServiceEnabled('El servicio de auditoría (auditd)', 'auditd', 'Sin este servicio activo, el servidor no está registrando la actividad que ocurre en él — si hay un incidente, no habría forma de investigar qué pasó.'),
  '19624': fServiceEnabled('El servicio de registro rsyslog', 'rsyslog', 'Sin este servicio, los eventos del sistema no quedan centralizados ni disponibles para revisión — perdiendo visibilidad sobre lo que pasa en el servidor.'),
  '19628': fServiceEnabled('El servicio de registro syslog-ng', 'syslog-ng', 'Sin este servicio, los eventos del sistema no quedan centralizados ni disponibles para revisión.'),
  '19631': t(
    'Servicio de registro instalado (rsyslog o syslog-ng)',
    'Confirma que hay instalado algún servicio de registro del sistema (rsyslog o syslog-ng).',
    'Sin un servicio de registro, el sistema operativo no deja rastro estructurado de lo que ocurre — cualquier investigación de incidentes empezaría a ciegas.',
    'Instalar rsyslog o syslog-ng.',
  ),
  '28545': t(
    'Chrony corre con usuario sin privilegios',
    'Confirma que el servicio de sincronización horaria (chrony) corre con un usuario limitado (_chrony), no como root.',
    'Si un servicio que recibe datos de servidores externos corriera como root, una falla de seguridad en él comprometería todo el servidor; con un usuario limitado, el daño queda contenido.',
    'Verificar que chrony está configurado para ejecutarse como el usuario _chrony (comportamiento por defecto del paquete).',
  ),
  '28546': fServiceEnabled('El servicio de sincronización horaria (chrony)', 'chrony', 'Un servidor con la hora desincronizada genera registros con marcas de tiempo poco confiables, lo que complica investigar incidentes y puede romper validaciones de certificados o tokens de sesión.'),
  '28547': fServiceEnabled('El servicio de sincronización horaria (systemd-timesyncd)', 'systemd-timesyncd', 'Un servidor con la hora desincronizada genera registros con marcas de tiempo poco confiables, lo que complica investigar incidentes y puede romper validaciones de certificados o tokens de sesión.'),
  '19557': t(
    'Sincronización horaria activa',
    'Confirma que el servidor tiene algún mecanismo de sincronización horaria activo (chrony o systemd-timesyncd).',
    'Un servidor con la hora desincronizada genera registros con marcas de tiempo poco confiables, lo que complica investigar incidentes y puede romper validaciones de certificados o tokens de sesión.',
    'Instalar y habilitar chrony o systemd-timesyncd.',
  ),
  '28575': fServiceEnabled('El firewall ufw', 'ufw', 'Es el firewall del sistema operativo — sin él activo, no hay una capa de defensa a nivel de servidor contra tráfico no autorizado.'),
  '28582': fServiceEnabled('El firewall nftables', 'nftables', 'Es el firewall del sistema operativo — sin él activo, no hay una capa de defensa a nivel de servidor contra tráfico no autorizado.'),
  '28590': t(
    'Paquetes de auditd instalados',
    'Confirma que los paquetes del servicio de auditoría (auditd) están instalados en el servidor.',
    'Sin ellos, el servidor no tiene forma de registrar la actividad sensible que ocurre en él.',
    'Instalar el paquete auditd.',
  ),
  '28591': fServiceEnabled('El servicio de auditoría (auditd)', 'auditd', 'Sin este servicio activo, el servidor no está registrando la actividad que ocurre en él — si hay un incidente, no habría forma de investigar qué pasó.'),
  '28616': fServiceEnabled('El servicio de registro journald', 'systemd-journald', 'Sin este servicio, el sistema no está centralizando sus registros — perdiendo visibilidad sobre lo que pasa en el servidor.'),

  // --- Firewall: política por defecto ---
  '19603': fFirewallDeny('iptables'),
  '28577': fFirewallDeny('ufw'),
  '28581': fFirewallDeny('nftables'),
  '28586': fFirewallDeny('iptables'),
  '28588': fFirewallDeny('ip6tables'),
  '19604': t(
    'Tráfico interno (loopback) permitido explícitamente',
    'Confirma que el tráfico de loopback (el servidor comunicándose consigo mismo) está permitido explícitamente en el firewall, mientras todo lo demás se deniega por defecto.',
    'Muchos servicios internos del sistema dependen de poder comunicarse consigo mismos por loopback; si el firewall lo bloquea sin querer, el servidor puede fallar de formas difíciles de diagnosticar.',
    'Agregar una regla explícita que permita tráfico de entrada y salida por la interfaz "lo" (loopback).',
  ),

  // --- Auditoría: eventos específicos ---
  '19610': fAuditEvent('la fecha y hora del sistema', 'Un cambio no autorizado en la fecha/hora suele ser una forma de intentar cubrir huellas en otros registros — si no se audita, ese intento pasaría desapercibido.'),
  '19611': fAuditEvent('la información de usuarios y grupos', 'Crear o modificar cuentas es una de las formas más comunes de mantener acceso después de comprometer un servidor — sin esta regla de auditoría, ese cambio no dejaría rastro.'),
  '19612': fAuditEvent('la configuración de red del sistema', 'Un cambio no autorizado en la red del servidor (rutas, interfaces) puede ser el primer paso de un ataque o de una fuga de datos — sin auditoría, no quedaría registro de quién lo hizo.'),
  '28599': fAuditEvent('la fecha y hora del sistema', 'Un cambio no autorizado en la fecha/hora suele ser una forma de intentar cubrir huellas en otros registros — si no se audita, ese intento pasaría desapercibido.'),
  '19609': t(
    'Auditoría desde el arranque del sistema',
    'Confirma que auditd registra eventos incluso de procesos que arrancan antes de que el propio servicio de auditoría esté activo.',
    'Sin esto, quedaría un hueco de auditoría justo en el momento más temprano y sensible del arranque del servidor.',
    'Agregar el parámetro "audit=1" a la línea de arranque del kernel (GRUB) y actualizar la configuración de arranque.',
  ),
  '28592': t(
    'Auditoría desde el arranque del sistema',
    'Confirma que auditd registra eventos incluso de procesos que arrancan antes de que el propio servicio de auditoría esté activo.',
    'Sin esto, quedaría un hueco de auditoría justo en el momento más temprano y sensible del arranque del servidor.',
    'Agregar el parámetro "audit=1" a la línea de arranque del kernel (GRUB) y actualizar la configuración de arranque.',
  ),
  '28593': t(
    'Espacio de buffer de auditoría suficiente',
    'Confirma que el sistema tiene reservado suficiente espacio de memoria para no perder eventos de auditoría cuando hay mucha actividad de golpe.',
    'Si el buffer se llena, el sistema empieza a descartar eventos de auditoría silenciosamente — quedarían huecos justo cuando más actividad (y quizás más riesgo) hay.',
    'Aumentar el parámetro audit_backlog_limit en la configuración de arranque del kernel.',
  ),
  '28594': t(
    'Tamaño de archivo de auditoría configurado',
    'Confirma que hay un tamaño máximo definido para los archivos de registro de auditoría.',
    'Sin un límite definido, los registros pueden crecer sin control y llenar el disco, o quedar mal dimensionados y perder información histórica.',
    'Definir "max_log_file" en /etc/audit/auditd.conf.',
  ),
  '28595': t(
    'Registros de auditoría no se borran automáticamente',
    'Confirma que el sistema no borra automáticamente los registros de auditoría viejos cuando llega al límite de espacio.',
    'Esos registros son la evidencia para investigar incidentes — borrarlos automáticamente puede eliminar justo lo que se necesitaría después de un ataque.',
    'En auditd.conf, configurar "max_log_file_action" para que rote los archivos (keep_logs) en vez de borrarlos.',
  ),
  '28596': t(
    'El sistema reacciona si se llena el espacio de auditoría',
    'Confirma qué hace el servidor cuando el espacio para registros de auditoría se agota por completo.',
    'En un ambiente donde el cumplimiento exige que todo quede registrado, es preferible que el sistema se detenga a que siga operando sin dejar rastro de lo que pasa.',
    'Configurar "admin_space_left_action"/"disk_full_action" en auditd.conf según la política de la empresa.',
  ),
  '28605': t(
    'Configuración de auditoría inmutable',
    'Confirma que la configuración de auditoría no se puede modificar sin reiniciar el servidor.',
    'Si alguien con acceso pudiera simplemente apagar la auditoría para operar sin dejar rastro, toda la auditoría perdería su valor como evidencia.',
    'Agregar la línea "-e 2" al final de las reglas de auditd (la marca como inmutable hasta el próximo reinicio).',
  ),
  '28606': fAuditFilePerm('los archivos de registro'),
  '28607': fAuditFilePerm('los archivos de configuración'),
  '28608': fAuditFilePerm('los archivos de configuración'),
  '28609': fAuditFilePerm('los archivos de configuración'),
  '28610': fAuditFilePerm('las herramientas (binarios)'),
  '28611': fAuditFilePerm('las herramientas (binarios)'),
  '28612': fAuditFilePerm('las herramientas (binarios)'),
  '28613': t(
    'Integridad de las herramientas de auditoría verificada',
    'Confirma que hay un mecanismo (como AIDE) vigilando que los binarios de auditoría no se alteren sin autorización.',
    'Si alguien pudiera reemplazar las propias herramientas de auditoría por versiones alteradas, podría manipular qué se registra sin que se note.',
    'Configurar AIDE (u otra herramienta de verificación de integridad) para vigilar los binarios de auditd.',
  ),
  '28617': t(
    'Compresión de registros del sistema activada',
    'Confirma que los registros del sistema (journald) se comprimen automáticamente.',
    'Evita que los registros llenen el disco antes de tiempo, lo que podría hacer que el sistema deje de auditar por falta de espacio.',
    'Activar "Compress=yes" en la configuración de journald.',
  ),
  '28749': t(
    'Aviso anticipado de espacio bajo en auditoría',
    'Confirma que el sistema avisa cuando el espacio para registros de auditoría se está agotando.',
    'Una alerta a tiempo permite actuar (ampliar espacio, rotar registros) antes de perder capacidad de registrar eventos.',
    'Configurar "space_left" y "space_left_action" en /etc/audit/auditd.conf para que avise con anticipación.',
  ),

  // --- SSH ---
  '19641': fSsh('SSH usa el protocolo 2', 'Confirma que el servidor SSH usa la versión 2 del protocolo, no la 1.', 'La versión 1 de SSH tiene fallas de seguridad conocidas y ya no se considera segura.', 'Fijar "Protocol 2"'),
  '19642': fSsh('SSH registra información suficiente', 'Confirma que el servidor SSH registra información suficiente de cada conexión.', 'Sin este nivel de detalle, no se podría saber quién se conectó, cuándo, ni si intentó autenticarse sin éxito.', 'Fijar "LogLevel INFO"'),
  '19645': fSsh('SSH ignora archivos .rhosts', 'Confirma que SSH ignora los archivos .rhosts, un mecanismo antiguo de confianza entre servidores.', 'Ese mecanismo permite iniciar sesión sin contraseña basándose solo en el nombre del servidor de origen, algo fácil de falsificar.', 'Fijar "IgnoreRhosts yes"'),
  '19646': fSsh('Autenticación por host deshabilitada en SSH', 'Confirma que SSH no permite autenticación basada solo en la identidad del servidor que se conecta.', 'Es un mecanismo de confianza débil, vulnerable a suplantación de identidad de red.', 'Fijar "HostbasedAuthentication no"'),
  '19647': fSsh('Inicio de sesión como root deshabilitado en SSH', 'Confirma que no se puede iniciar sesión por SSH directamente como el usuario root.', 'Si root pudiera entrar directo, alguien que adivine o robe esa contraseña tendría control total del servidor de inmediato, y además se pierde el registro de qué persona real hizo cada acción.', 'Fijar "PermitRootLogin no" — cada persona entra con su propio usuario y usa sudo para las acciones administrativas'),
  '19648': fSsh('Contraseñas vacías no permitidas en SSH', 'Confirma que no se permite iniciar sesión por SSH con una contraseña vacía.', 'Una cuenta sin contraseña es una puerta abierta a cualquiera.', 'Fijar "PermitEmptyPasswords no"'),
  '19649': fSsh('Variables de entorno de usuario restringidas en SSH', 'Confirma que los usuarios no pueden definir variables de entorno personalizadas que afecten cómo arranca su sesión SSH.', 'Esta función se ha usado en el pasado para saltarse restricciones de seguridad de la sesión.', 'Fijar "PermitUserEnvironment no"'),
  '19650': fSsh('Algoritmos criptográficos aprobados en SSH', 'Confirma que SSH solo acepta algoritmos de cifrado e intercambio de llaves modernos y seguros.', 'Los algoritmos criptográficos antiguos se pueden romper con herramientas actuales, exponiendo la conexión aunque parezca estar "cifrada".', 'Fijar explícitamente las listas de MACs permitidos a solo las opciones modernas recomendadas'),
  '28634': fPermissions('/etc/ssh/sshd_config', 'Si cualquier usuario pudiera leer o modificar la configuración de SSH, podría debilitar la seguridad de acceso remoto sin que nadie lo note.', '0600'),
  '28635': fSsh('Acceso SSH restringido a usuarios autorizados', 'Confirma que solo usuarios o grupos específicos autorizados pueden conectarse por SSH.', 'Sin esta restricción, cualquier cuenta válida del sistema podría intentar entrar por SSH, ampliando la superficie de ataque.', 'Usar "AllowUsers"/"AllowGroups" (o sus opuestos Deny) para limitar quién puede conectarse'),
  '28636': fSsh('SSH registra información suficiente', 'Confirma que el servidor SSH registra información suficiente de cada conexión.', 'Sin este nivel de detalle, no se podría saber quién se conectó, cuándo, ni si intentó autenticarse sin éxito.', 'Fijar "LogLevel INFO" o "VERBOSE"'),
  '28637': fSsh('SSH usa el sistema estándar de autenticación (PAM)', 'Confirma que SSH usa el sistema estándar de autenticación del sistema operativo (PAM).', 'PAM es donde viven las políticas de bloqueo de cuenta y complejidad de contraseña — si SSH no lo usa, esas políticas no aplican a los inicios de sesión remotos.', 'Fijar "UsePAM yes"'),
  '28638': fSsh('Inicio de sesión como root deshabilitado en SSH', 'Confirma que no se puede iniciar sesión por SSH directamente como el usuario root.', 'Si root pudiera entrar directo, alguien que adivine o robe esa contraseña tendría control total del servidor de inmediato, y además se pierde el registro de qué persona real hizo cada acción.', 'Fijar "PermitRootLogin no"'),
  '28639': fSsh('Autenticación por host deshabilitada en SSH', 'Confirma que SSH no permite autenticación basada solo en la identidad del servidor que se conecta.', 'Es un mecanismo de confianza débil, vulnerable a suplantación de identidad de red.', 'Fijar "HostbasedAuthentication no"'),
  '28640': fSsh('Contraseñas vacías no permitidas en SSH', 'Confirma que no se permite iniciar sesión por SSH con una contraseña vacía.', 'Una cuenta sin contraseña es una puerta abierta a cualquiera.', 'Fijar "PermitEmptyPasswords no"'),
  '28641': fSsh('Variables de entorno de usuario restringidas en SSH', 'Confirma que los usuarios no pueden definir variables de entorno personalizadas que afecten cómo arranca su sesión SSH.', 'Esta función se ha usado en el pasado para saltarse restricciones de seguridad de la sesión.', 'Fijar "PermitUserEnvironment no"'),
  '28642': fSsh('SSH ignora archivos .rhosts', 'Confirma que SSH ignora los archivos .rhosts, un mecanismo antiguo de confianza entre servidores.', 'Ese mecanismo permite iniciar sesión sin contraseña basándose solo en el nombre del servidor de origen, algo fácil de falsificar.', 'Fijar "IgnoreRhosts yes"'),
  '28644': fSsh('Algoritmos de cifrado aprobados en SSH', 'Confirma que SSH solo acepta algoritmos de cifrado modernos y seguros para las conexiones.', 'Los algoritmos de cifrado antiguos se pueden romper con herramientas actuales, exponiendo la conexión aunque parezca estar "cifrada".', 'Fijar explícitamente la lista de "Ciphers" permitidos'),
  '28645': fSsh('Algoritmos de integridad aprobados en SSH', 'Confirma que SSH solo acepta algoritmos de verificación de integridad (MACs) modernos y seguros.', 'Los algoritmos antiguos se pueden romper con herramientas actuales, permitiendo alterar datos en tránsito sin ser detectado.', 'Fijar explícitamente la lista de "MACs" permitidos'),
  '28646': fSsh('Algoritmos de intercambio de llaves aprobados en SSH', 'Confirma que SSH solo acepta algoritmos de intercambio de llaves modernos y seguros al negociar la conexión.', 'Los algoritmos antiguos de intercambio de llaves tienen debilidades conocidas que podrían permitir descifrar la conexión.', 'Fijar explícitamente la lista de "KexAlgorithms" permitidos'),
  '28648': fSsh('Aviso legal antes de conectarse por SSH', 'Confirma que se muestra un aviso legal antes de iniciar sesión por SSH.', 'Deja constancia de que el acceso es monitoreado y solo para personal autorizado — algo que suele pedirse en auditorías de cumplimiento.', 'Fijar "Banner /etc/issue.net" (o el archivo correspondiente)'),
  '28649': fSsh('Límite de intentos de autenticación en SSH', 'Confirma que hay un límite de intentos de autenticación por conexión SSH.', 'Sin límite, alguien podría intentar adivinar la contraseña muchas veces en la misma conexión.', 'Fijar "MaxAuthTries" a un número bajo (ej. 4)'),
  '28652': fSsh('Tiempo límite para completar el login en SSH', 'Confirma que hay un tiempo límite para completar el inicio de sesión antes de que SSH cierre la conexión.', 'Sin límite, conexiones a medio autenticar podrían quedar abiertas indefinidamente, consumiendo recursos y ampliando la ventana de ataque.', 'Fijar "LoginGraceTime" a un valor corto (ej. 60 segundos)'),
  '28653': fSsh('Sesiones SSH inactivas se cierran solas', 'Confirma que las sesiones SSH inactivas se cierran automáticamente después de un tiempo.', 'Una sesión abierta y olvidada es una puerta de acceso que ya no está bajo control de nadie.', 'Fijar "ClientAliveInterval" y "ClientAliveCountMax" para que la sesión se cierre tras un período razonable de inactividad'),
  '28717': fSsh('Reenvío de puertos deshabilitado en SSH', 'Confirma que SSH no permite reenviar puertos ni tráfico gráfico (X11) a través de la conexión.', 'El reenvío de puertos se puede usar para saltarse el firewall y llegar a servicios internos que no deberían ser alcanzables desde fuera.', 'Fijar "DisableForwarding yes"'),
  '28718': fSsh('Autenticación GSSAPI deshabilitada en SSH', 'Confirma que SSH no acepta autenticación vía GSSAPI (Kerberos), salvo que la empresa use ese esquema explícitamente.', 'Es una superficie de autenticación adicional que, si no se usa, solo agrega riesgo sin ningún beneficio.', 'Fijar "GSSAPIAuthentication no" (salvo que el servidor realmente use Kerberos)'),

  // --- Contraseñas: bloqueo por intentos fallidos ---
  '28662': t('Bloqueo por intentos fallidos de contraseña', 'Confirma que la cuenta se bloquea temporalmente después de varios intentos fallidos de contraseña.', 'Sin esto, alguien puede probar contraseñas indefinidamente hasta acertar (fuerza bruta) sin que el sistema reaccione.', 'Configurar el módulo pam_faillock para bloquear la cuenta tras varios intentos fallidos.'),
  '28722': t('Módulo de bloqueo por intentos fallidos activo', 'Confirma que el módulo pam_faillock, encargado de bloquear cuentas tras intentos fallidos, está activo.', 'Sin este módulo activo, la política de bloqueo por intentos fallidos simplemente no se aplica, aunque esté configurada.', 'Habilitar pam_faillock en la configuración de PAM.'),
  '28723': t('Tiempo de bloqueo de cuenta configurado', 'Confirma que hay definido cuánto tiempo queda bloqueada una cuenta tras varios intentos fallidos.', 'Sin un tiempo definido, el bloqueo podría ser demasiado corto (sin disuadir un ataque de fuerza bruta) o quedar indefinido sin que nadie lo sepa desbloquear.', 'Configurar "unlock_time" en pam_faillock.'),
  '28724': t('Bloqueo por intentos fallidos incluye a root', 'Confirma que la política de bloqueo por intentos fallidos también aplica a la cuenta root.', 'Si root quedara exento, sería el único objetivo sin ninguna protección contra intentos de adivinar la contraseña por fuerza bruta.', 'Configurar pam_faillock para que incluya la cuenta root ("even_deny_root").'),

  // --- Contraseñas: hash ---
  '28664': t('Algoritmo de cifrado de contraseñas fuerte', 'Confirma que las contraseñas se guardan cifradas con un algoritmo moderno y seguro, no uno antiguo y débil.', 'Si el algoritmo es débil, alguien que robe el archivo de contraseñas podría descifrarlas con herramientas actuales.', 'Configurar PAM para usar SHA-512 al generar los hashes de contraseña.'),
  '28739': t('Algoritmo de cifrado de contraseñas fuerte (pam_unix)', 'Confirma que el módulo estándar de autenticación (pam_unix) usa un algoritmo de cifrado de contraseñas moderno.', 'Si el algoritmo es débil, alguien que robe el archivo de contraseñas podría descifrarlas con herramientas actuales.', 'Configurar pam_unix para usar SHA-512.'),

  // --- Contraseñas: vigencia ---
  '28665': fPasswordAging('Edad mínima de contraseña configurada', 'Confirma que hay un tiempo mínimo antes de poder volver a cambiar la contraseña.'),
  '28666': fPasswordAging('Expiración de contraseña configurada', 'Confirma que las contraseñas tienen una fecha de expiración definida.'),
  '28667': fPasswordAging('Aviso de expiración de contraseña configurado', 'Confirma que se avisa con anticipación antes de que una contraseña expire.'),
  '28668': t('Bloqueo de cuentas inactivas', 'Confirma que las cuentas se bloquean automáticamente después de un período de inactividad.', 'Una cuenta que nadie usa hace tiempo, pero sigue activa, es un objetivo atractivo — es más probable que nadie note un uso indebido.', 'Configurar el período de inactividad tras el cual se bloquea la cuenta (useradd -D -f, o chage).'),

  // --- Contraseñas: calidad ---
  '28725': fPasswordQuality('Cantidad mínima de caracteres distintos en la contraseña nueva', 'Confirma que una contraseña nueva debe diferir lo suficiente de la anterior, no solo cambiar un carácter.'),
  '28726': fPasswordQuality('Longitud mínima de contraseña', 'Confirma que las contraseñas nuevas cumplen una longitud mínima.'),
  '28727': fPasswordQuality('Complejidad de contraseña exigida', 'Confirma que las contraseñas nuevas combinan mayúsculas, minúsculas, números y símbolos.'),
  '28728': fPasswordQuality('Sin caracteres repetidos seguidos en la contraseña', 'Confirma que las contraseñas nuevas no repiten el mismo carácter varias veces seguidas (ej. "aaaa1234").'),
  '28729': fPasswordQuality('Sin secuencias obvias en la contraseña', 'Confirma que las contraseñas nuevas no usan secuencias obvias de teclado o de caracteres (ej. "12345", "abcde").'),
  '28730': fPasswordQuality('Verificación contra diccionario de contraseñas comunes', 'Confirma que las contraseñas nuevas se comparan contra una lista de contraseñas comunes o filtradas, y se rechazan si coinciden.'),
  '28731': fPasswordQuality('Verificación de calidad de contraseña activa', 'Confirma que el sistema efectivamente aplica las reglas de calidad de contraseña configuradas (no solo las tiene definidas sin usarlas).'),
  '28732': fPasswordQuality('Reglas de calidad de contraseña aplican también a root', 'Confirma que las mismas reglas de calidad de contraseña aplican a la cuenta root, no solo a usuarios normales.'),
  '28733': t('Historial de contraseñas', 'Confirma que el sistema recuerda contraseñas anteriores para evitar que se reutilicen.', 'Sin esto, alguien podría "rotar" su contraseña alternando entre las mismas dos de siempre, anulando el propósito de la política de cambio periódico.', 'Configurar "remember" en pam_unix o pam_pwhistory con la cantidad de contraseñas anteriores a recordar.'),
  '28734': t('Historial de contraseñas también para root', 'Confirma que la política de no reutilizar contraseñas anteriores también aplica a la cuenta root.', 'Si root quedara exento, sería la cuenta más crítica del sistema la única sin esta protección.', 'Configurar el historial de contraseñas para que incluya también a root.'),

  // --- Permisos de archivos ---
  '19541': fPermissions('/etc/motd', 'Si cualquiera pudiera editar el aviso de inicio de sesión, podría usarse para engañar a otros usuarios (phishing interno) o para quitar el aviso legal de acceso.', '0644'),
  '19542': fPermissions('/etc/issue', 'Si cualquiera pudiera editar el aviso de inicio de sesión, podría usarse para engañar a otros usuarios (phishing interno) o para quitar el aviso legal de acceso.', '0644'),
  '19543': fPermissions('/etc/issue.net', 'Si cualquiera pudiera editar el aviso de inicio de sesión remoto, podría usarse para engañar a otros usuarios o para quitar el aviso legal de acceso.', '0644'),
  '28670': fPermissions('/etc/passwd', 'Es el archivo con la lista de todos los usuarios del sistema — si cualquiera pudiera modificarlo, podría crear cuentas o alterar privilegios sin autorización.', '0644'),
  '28671': fPermissions('/etc/passwd- (respaldo)', 'Es el respaldo del archivo de usuarios — debe protegerse igual que el original.', '0600'),
  '28672': fPermissions('/etc/group', 'Es el archivo con la lista de grupos del sistema — si cualquiera pudiera modificarlo, podría agregarse a sí mismo a un grupo con privilegios.', '0644'),
  '28673': fPermissions('/etc/group- (respaldo)', 'Es el respaldo del archivo de grupos — debe protegerse igual que el original.', '0600'),
  '28674': fPermissions('/etc/shadow', 'Contiene las contraseñas cifradas de todos los usuarios — si cualquiera pudiera leerlo, podría intentar descifrarlas fuera de línea sin que nadie lo note.', '0600'),
  '28675': fPermissions('/etc/shadow- (respaldo)', 'Es el respaldo del archivo de contraseñas cifradas — debe protegerse igual que el original.', '0600'),
  '28676': fPermissions('/etc/gshadow', 'Contiene las contraseñas cifradas de grupos — debe protegerse con el mismo cuidado que el archivo de contraseñas de usuarios.', '0600'),
  '28677': fPermissions('/etc/gshadow- (respaldo)', 'Es el respaldo del archivo de contraseñas de grupos — debe protegerse igual que el original.', '0600'),
  '28678': t('Contraseñas cifradas en uso (shadow)', 'Confirma que ninguna cuenta tiene su contraseña guardada directamente en /etc/passwd en vez de cifrada en /etc/shadow.', 'Una contraseña sin cifrar en un archivo legible por más usuarios que /etc/shadow es una exposición directa e innecesaria.', 'Migrar cualquier cuenta encontrada así al esquema estándar de shadow passwords.'),
  '28679': t('Sin campos de contraseña vacíos', 'Confirma que ninguna cuenta del sistema tiene el campo de contraseña completamente vacío en /etc/shadow.', 'Un campo de contraseña vacío puede significar una cuenta sin protección alguna, dependiendo de la configuración del sistema.', 'Fijar una contraseña o bloquear cualquier cuenta encontrada con este campo vacío.'),
  '28538': t('Aviso legal de acceso local', 'Confirma que se muestra un aviso legal antes de iniciar sesión localmente en el servidor.', 'Documenta que el acceso es monitoreado y restringido a personal autorizado — auditores de SOC 2 suelen pedir evidencia de este aviso.', 'Configurar el texto del aviso en /etc/motd o /etc/issue.'),
  '28539': t('Aviso legal de acceso remoto', 'Confirma que se muestra un aviso legal antes de iniciar sesión remotamente al servidor.', 'Documenta que el acceso es monitoreado y restringido a personal autorizado — auditores de SOC 2 suelen pedir evidencia de este aviso.', 'Configurar el texto del aviso en /etc/issue.net.'),

  // --- Integridad de archivos ---
  '19522': t('Herramienta de integridad de archivos instalada (AIDE)', 'Confirma que hay instalada una herramienta de verificación de integridad de archivos (AIDE).', 'Sin ella, no habría forma de detectar si alguien modificó un archivo crítico del sistema sin autorización.', 'Instalar el paquete AIDE y generar su base de datos inicial.'),
  '19523': t('Verificación de integridad de archivos programada', 'Confirma que la verificación de integridad de archivos corre de forma periódica, no solo quedó instalada sin usarse.', 'Una herramienta instalada pero que nunca se ejecuta no aporta ninguna protección real.', 'Programar la ejecución de AIDE con una tarea periódica (cron o systemd timer).'),

  // --- Correo ---
  '19573': t('Agente de correo en modo solo local', 'Confirma que el agente de correo del sistema operativo (usado para notificaciones internas, no para enviar correo real) solo escucha conexiones locales.', 'Si queda expuesto a la red, puede usarse para enviar correo no autorizado (spam/relay) usando este servidor.', 'Configurar el agente de correo (Postfix/Exim) en modo "local only", escuchando solo en 127.0.0.1.'),

  // --- Cuenta root ---
  '28740': t('Root es la única cuenta con privilegio máximo', 'Confirma que no existe ninguna otra cuenta además de "root" con el máximo nivel de privilegio (UID 0).', 'Una segunda cuenta con privilegios de root, sobre todo si nadie la recuerda, es una puerta trasera perfecta — nadie audita algo que no sabe que existe.', 'Revisar /etc/passwd y eliminar o corregir cualquier cuenta con UID 0 que no sea "root".'),
  '28742': t('Contraseña de root definida', 'Confirma que la cuenta root tiene una contraseña definida, no vacía ni deshabilitada de forma insegura.', 'Una cuenta root sin contraseña podría quedar accesible sin autenticación en ciertos escenarios (por ejemplo, modo de recuperación), aunque el login remoto directo esté bloqueado.', 'Fijar una contraseña fuerte para la cuenta root.'),
  '28743': t('Máscara de permisos (umask) de root configurada', 'Confirma que los archivos nuevos que crea la cuenta root no quedan con permisos demasiado abiertos por defecto.', 'Un umask débil puede exponer información sensible por simple descuido, sin que nadie cambie permisos a propósito.', 'Fijar "umask 027" en el perfil de shell de root.'),
  '28745': t('Máscara de permisos (umask) por defecto configurada', 'Confirma que los archivos nuevos que crea cualquier usuario no quedan con permisos demasiado abiertos por defecto.', 'Un umask débil puede exponer información sensible por simple descuido, sin que nadie cambie permisos a propósito.', 'Fijar "umask 027" en /etc/bashrc y /etc/profile.'),

  // --- Windows: políticas de grupo ---
  '26014': t(
    'Sistema no se apaga si falla la auditoría de seguridad',
    'Confirma que el sistema NO está configurado para apagarse automáticamente si falla el registro de auditoría de seguridad.',
    'Aunque suena contraintuitivo, dejarlo habilitado puede convertirse en una forma de negación de servicio: cualquier falla del subsistema de auditoría apagaría el servidor. Se prefiere que siga funcionando y que la falla de auditoría se investigue por otro medio.',
    'En la Política de Grupo, fijar "Audit: Shut down system immediately if unable to log security audits" en Deshabilitado.',
  ),
  '26023': t(
    'No se muestra el último usuario que inició sesión',
    'Confirma que la pantalla de inicio de sesión de Windows no muestra el nombre del último usuario que inició sesión.',
    'Mostrar ese nombre le da a un atacante la mitad de las credenciales gratis: ya sabe qué usuario probar.',
    'En la Política de Grupo, habilitar "Interactive logon: Don\'t display last signed-in".',
  ),
  '26038': t(
    'Validación estricta de identidad en recursos compartidos',
    'Confirma el nivel de validación que usa el servidor para verificar la identidad de quien se conecta a recursos compartidos de red.',
    'Una validación más estricta dificulta ataques donde alguien se hace pasar por el servidor (relay attacks).',
    'Ajustar la Política de Grupo "Microsoft network server: Server SPN target name validation level" al nivel indicado.',
  ),
  '26052': t(
    'Autenticación con identidades en línea deshabilitada',
    'Confirma que el servidor no acepta un método de autenticación (PKU2U) pensado para cuentas de Microsoft/en línea, irrelevante en un servidor corporativo.',
    'Es una superficie de autenticación adicional sin uso real en este contexto — deshabilitarla reduce el riesgo sin costo.',
    'Deshabilitar la Política de Grupo correspondiente a PKU2U.',
  ),
  '26063': t(
    'Permisos reforzados en objetos internos del sistema',
    'Confirma que los objetos internos del sistema (como enlaces simbólicos) tienen permisos reforzados por defecto.',
    'Sin esto, sería más fácil para un proceso sin privilegios manipular objetos internos para escalar permisos.',
    'Habilitar la Política de Grupo "System objects: Strengthen default permissions of internal system objects".',
  ),
  '26120': t(
    'Espacio de registro del firewall (perfil de Dominio) suficiente',
    'Confirma que el registro del firewall de Windows, en el perfil de Dominio, tiene espacio suficiente reservado.',
    'Un límite muy bajo hace que los registros más antiguos se sobrescriban rápido, perdiendo evidencia útil para investigar incidentes.',
    'Fijar el tamaño máximo del log del firewall (perfil Dominio) a 16,384 KB o más.',
  ),
  '26127': t(
    'Espacio de registro del firewall (perfil Privado) suficiente',
    'Confirma que el registro del firewall de Windows, en el perfil Privado, tiene espacio suficiente reservado.',
    'Un límite muy bajo hace que los registros más antiguos se sobrescriban rápido, perdiendo evidencia útil para investigar incidentes.',
    'Fijar el tamaño máximo del log del firewall (perfil Privado) a 16,384 KB o más.',
  ),
  '26168': t(
    'Reconocimiento de voz en línea deshabilitado',
    'Confirma que no se puede activar el reconocimiento de voz en línea, que envía audio a servidores externos.',
    'En un servidor no tiene ningún uso legítimo, y representa una fuga de datos potencial innecesaria.',
    'Deshabilitar la Política de Grupo "Allow users to enable online speech recognition services".',
  ),
  '26176': t(
    'Resolución de nombres de red configurada de forma segura',
    'Confirma el modo de resolución de nombres de red (NetBIOS) que usa el servidor.',
    'El modo P-node evita depender de mensajes de difusión (broadcast) en la red para resolver nombres, reduciendo la posibilidad de ataques de suplantación en la red local.',
    'Configurar la Política de Grupo de NetBT NodeType en modo P-node.',
  ),
  '26181': t(
    'Contraseñas de acceso telefónico no se guardan',
    'Confirma que Windows no guarda la contraseña de conexiones de acceso telefónico (dial-up).',
    'Es una funcionalidad heredada — guardar esa contraseña la deja expuesta a quien tenga acceso físico o remoto al equipo.',
    'Habilitar la Política de Grupo MSS "DisableSavePassword".',
  ),
  '26182': t(
    'Redirecciones ICMP no controlan las rutas de red',
    'Confirma que el servidor no acepta redirecciones ICMP para cambiar sus rutas de red automáticamente.',
    'Aceptar redirecciones ICMP sin control es una técnica clásica para desviar el tráfico de un servidor hacia un punto controlado por un atacante.',
    'Deshabilitar la Política de Grupo MSS "EnableICMPRedirect".',
  ),
  '26294': t(
    'Cliente NTP de Windows habilitado',
    'Confirma que el cliente de sincronización horaria de Windows está activo.',
    'Un servidor con la hora desincronizada genera registros con marcas de tiempo poco confiables, lo que complica investigar incidentes y puede romper validaciones de certificados o tokens de sesión.',
    'Habilitar la Política de Grupo "Enable Windows NTP Client".',
  ),
  '26295': t(
    'Servidor NTP de Windows deshabilitado',
    'Confirma que este equipo no está ofreciendo hora a otros equipos (rol de servidor NTP), salvo que deba hacerlo.',
    'Ofrecer un servicio que no se necesita amplía la superficie de ataque sin ningún beneficio para este servidor.',
    'Deshabilitar la Política de Grupo "Enable Windows NTP Server" (salvo que este equipo sí deba ser fuente de hora para otros).',
  ),
};

async function main() {
  const apply = process.argv.includes('--apply');
  const connectionString = process.env.CENTRAL_DATABASE_URL;
  if (!connectionString) throw new Error('CENTRAL_DATABASE_URL no está definida');
  const pool = new Pool({ connectionString });

  const usedIds = (await pool.query(`SELECT DISTINCT check_id FROM mnk_control_checks ORDER BY check_id`)).rows.map((r) => r.check_id);
  const covered = usedIds.filter((id) => TRANSLATIONS[id]);
  const missing = usedIds.filter((id) => !TRANSLATIONS[id]);

  console.log(`check_ids usados: ${usedIds.length}`);
  console.log(`cubiertos por este script: ${covered.length}`);
  if (missing.length) {
    console.log(`⚠️  SIN cubrir (no se tocan, quedan con lo que había antes): ${missing.join(', ')}`);
  }

  if (!apply) {
    console.log('\n[DRY-RUN] Ejemplo de 2 traducciones:');
    console.log(JSON.stringify(TRANSLATIONS[covered[0]], null, 2));
    console.log(JSON.stringify(TRANSLATIONS[covered[1]], null, 2));
    console.log('\nCorré con --apply para escribir de verdad.');
    await pool.end();
    return;
  }

  let written = 0;
  for (const id of covered) {
    const tr = TRANSLATIONS[id];
    await pool.query(
      `INSERT INTO mnk_cis_check_translations (check_id, title_es, description_es, rationale_es, remediation_es, updated_at)
       VALUES ($1, $2, $3, $4, $5, now())
       ON CONFLICT (check_id) DO UPDATE SET
         title_es = EXCLUDED.title_es,
         description_es = EXCLUDED.description_es,
         rationale_es = EXCLUDED.rationale_es,
         remediation_es = EXCLUDED.remediation_es,
         updated_at = now()`,
      [id, tr.title_es, tr.description_es, tr.rationale_es, tr.remediation_es],
    );
    written++;
  }
  console.log(`\n✅ ${written} traducciones escritas/actualizadas en mnk_cis_check_translations.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
