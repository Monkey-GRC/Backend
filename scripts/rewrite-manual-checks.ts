/**
 * Reescribe los 101 `ManualCheckItem` de la dimensión POLICY en UNA base
 * (central o un tenant) con contenido específico por control (no genérico):
 *
 *   - description: qué se evalúa (a partir del texto real del control).
 *   - rationale (campo nuevo): por qué importa, en términos de riesgo de
 *     negocio — no existía antes, se agregó en esta fase.
 *   - remediation: qué evidencia/documento concreto se debe cargar, a
 *     partir de la columna "GOBIERNO Evidencia requerida/indicada" del
 *     Excel de Nelson (reescrita en tono claro), o una sugerencia sensata
 *     cuando el Excel no traía nada.
 *
 * Se matchea por `Control.source_ref` (ej. "IAO-1"), no por nombre — ya no
 * depende de texto embebido en `description`.
 *
 * Uso:
 *   npx tsx scripts/rewrite-manual-checks.ts --db=central
 *   npx tsx scripts/rewrite-manual-checks.ts --db=central --apply
 *   npx tsx scripts/rewrite-manual-checks.ts --tenant-db-url="postgresql://..." --apply
 */
import 'dotenv/config';
import { Pool } from 'pg';

type Content = { description: string; rationale: string; remediation: string };

const c = (description: string, rationale: string, remediation: string): Content => ({ description, rationale, remediation });

const CONTENT: Record<string, Content> = {
  // --- Aseguramiento de la Información ---
  'IAO-1': c(
    'Se evalúa si la empresa realiza autoevaluaciones de sus propios controles al menos una vez al año, y si corrige lo que encuentra.',
    'Un control que nadie revisa tiende a dejar de cumplirse sin que nadie se entere — la autoevaluación es la forma de detectar esas fallas antes que un auditor externo o un incidente real.',
    'Cargar evidencia de la última autoevaluación de controles realizada y de las acciones correctivas derivadas de sus hallazgos.',
  ),
  'IAO-2': c(
    'Se evalúa si la empresa realiza pruebas de penetración al menos una vez al año y remedia lo que se encuentra.',
    'Una prueba de penetración simula un ataque real — sin ella, las vulnerabilidades de los sistemas solo se descubrirían cuando alguien ya las esté explotando.',
    'Cargar el reporte de la última prueba de penetración y evidencia de la remediación de los hallazgos encontrados.',
  ),

  // --- Clasificación y Tratamiento de Datos ---
  'DCH-1': c(
    'Se evalúa si la empresa elimina o depura los datos de un cliente cuando este deja de usar el servicio.',
    'Conservar datos de clientes que ya no son usuarios, sin necesidad de negocio, aumenta el impacto de una eventual filtración y puede incumplir leyes de protección de datos.',
    'Cargar el registro de eliminación de datos del último cliente que finalizó su relación con la empresa.',
  ),
  'DCH-10': c(
    'Se evalúa si la información personal se elimina, anonimiza o destruye de forma segura cuando ya no es necesaria.',
    'Guardar información personal más tiempo del necesario multiplica el daño posible si esos datos se filtran, y en muchas jurisdicciones es una infracción legal en sí misma.',
    'Cargar la Política de Gestión de Datos aprobada, y evidencia de al menos una disposición segura de información personal.',
  ),
  'DCH-11': c(
    'Se evalúa si existe una política que prohíba usar datos confidenciales de clientes en ambientes que no son de producción (como pruebas o desarrollo).',
    'Los ambientes de prueba suelen tener controles de seguridad más débiles que producción — usar datos reales ahí expone información sensible innecesariamente.',
    'Cargar la política que prohíbe el uso de datos confidenciales fuera de producción, o evidencia del proceso de anonimización de datos de prueba.',
  ),
  'DCH-2': c(
    'Se evalúa si la empresa retiene los datos transaccionales de un cliente mientras la cuenta esté activa, sin depurarlos antes de tiempo.',
    'Eliminar datos transaccionales antes de tiempo puede dejar a la empresa sin evidencia para resolver disputas o cumplir obligaciones contractuales con el cliente.',
    'Cargar la Política de Gestión de Datos aprobada y evidencia de aceptación por parte de los empleados.',
  ),
  'DCH-4': c(
    'Se evalúa si la empresa ofrece a sus clientes un portal con historial de su información transaccional y de cuenta.',
    'Sin visibilidad sobre su propia información, un cliente no puede detectar por su cuenta un uso indebido de su cuenta ni verificar que sus transacciones son correctas.',
    'Cargar capturas o registros (logs) del portal de cliente mostrando el historial disponible.',
  ),
  'DCH-5': c(
    'Se evalúa si existe una política de clasificación de datos que defina qué información es confidencial y quién puede acceder a ella.',
    'Sin una clasificación clara, es imposible aplicar controles de protección consistentes — no se puede proteger de forma especial algo que nadie identificó como sensible.',
    'Cargar la Política de Clasificación de Datos aprobada.',
  ),
  'DCH-7': c(
    'Se evalúa si la empresa comunica a los usuarios y terceros pertinentes cuando corrige o elimina información personal de alguien.',
    'Si un tercero sigue usando un dato que ya fue corregido o eliminado en el sistema principal, la empresa pierde el control real sobre esa información.',
    'Cargar evidencia de al menos una comunicación de corrección/eliminación de datos personales enviada a un tercero.',
  ),

  // --- Concientización y Capacitación en Seguridad ---
  'SAT-1': c(
    'Se evalúa si los empleados completan una capacitación de concientización en seguridad al ser contratados y luego al menos una vez al año.',
    'La mayoría de los incidentes de seguridad empiezan con un error humano (phishing, contraseñas débiles, manejo indebido de información) — la capacitación reduce directamente ese riesgo.',
    'Cargar evidencia de finalización de la capacitación (por ejemplo, reportes de la plataforma de entrenamiento) y la Política de Seguridad en Recursos Humanos aprobada.',
  ),

  // --- Continuidad del Negocio y Recuperación ante Desastres ---
  'BCD-1': c(
    'Se evalúa si existe un Plan de Continuidad del Negocio y Recuperación ante Desastres, con su plan de comunicación en caso de que personal clave no esté disponible.',
    'Sin un plan documentado, cualquier interrupción grave (falla técnica mayor, desastre natural, pérdida de personal clave) se enfrentaría de forma improvisada, aumentando el tiempo de recuperación y el impacto para los clientes.',
    'Cargar el Plan de Continuidad del Negocio y Recuperación ante Desastres, con evidencia de su aprobación.',
  ),
  'BCD-2': c(
    'Se evalúa si el plan de Continuidad del Negocio / Recuperación ante Desastres se pone a prueba al menos una vez al año.',
    'Un plan que nunca se prueba puede fallar justo cuando se necesita — la prueba periódica es la única forma de confirmar que realmente funcionaría en un desastre real.',
    'Cargar la evidencia del último ejercicio de simulación (tabletop) de recuperación ante desastres.',
  ),
  'BCD-3': c(
    'Se evalúa si la empresa mantiene una póliza de seguro de ciberseguridad vigente.',
    'Un incidente grave de seguridad puede tener un costo financiero que ponga en riesgo la operación de la empresa — el seguro limita ese impacto.',
    'Cargar el documento de la póliza de seguro de ciberseguridad vigente.',
  ),
  'BCD-4': c(
    'Se evalúa si las bases de datos de producción se replican en tiempo real a un centro de datos secundario, con alertas si la replicación falla.',
    'Sin una réplica al día, la pérdida del centro de datos principal significaría perder también los datos más recientes, no solo el servicio.',
    'Cargar evidencia de la configuración de replicación y de al menos un ejercicio de simulación de recuperación ante desastres.',
  ),
  'BCD-5': c(
    'Se evalúa si se realizan respaldos periódicos de los datos de producción, guardados en una ubicación distinta al sistema original.',
    'Un respaldo guardado en el mismo lugar que los datos originales no protege contra nada que afecte a ese lugar completo (falla de hardware, incendio, ransomware que cifra todo el servidor).',
    'Cargar evidencia de la configuración de respaldos y de al menos un ejercicio de restauración/recuperación probado.',
  ),
  'BCD-6': c(
    'Se evalúa si la empresa opera con múltiples zonas de disponibilidad, de forma que pueda seguir funcionando si pierde un centro de datos.',
    'Depender de una sola ubicación física significa que cualquier falla ahí (corte eléctrico, desastre natural, falla del proveedor de nube) tumba el servicio completo.',
    'Cargar un diagrama de red que muestre las zonas de disponibilidad en uso.',
  ),

  // --- Cumplimiento ---
  'CPL-2': c(
    'Se evalúa si existe una política de denuncias (whistleblower) con un canal anónimo para reportar fraude o irregularidades.',
    'Sin un canal seguro y anónimo, los empleados que detecten una irregularidad pueden preferir callar por miedo a represalias, dejando el problema sin resolver.',
    'Cargar el canal de denuncias anónimas disponible y la Política de Seguridad de la Información (AUP) aprobada.',
  ),

  // --- Desarrollo y Adquisición de Tecnología ---
  'TDA-1': c(
    'Se evalúa si el sistema exige contraseñas que cumplan requisitos mínimos de seguridad, validándolos o mostrando un error si no se cumplen.',
    'Sin esta validación a nivel de aplicación, un usuario podría elegir una contraseña trivial que facilite el acceso no autorizado a su cuenta.',
    'Cargar evidencia de la validación de requisitos de contraseña en el sistema (captura del mensaje de error al no cumplirse).',
  ),
  'TDA-2': c(
    'Se evalúa si los errores en la transferencia automática de archivos/datos entre componentes del sistema generan una alerta a los administradores.',
    'Sin alertas, una falla en el procesamiento de datos críticos podría pasar desapercibida durante días, afectando la integridad de la información sin que nadie lo note a tiempo.',
    'Cargar capturas del tablero de alertas operativas mostrando alertas de errores de procesamiento.',
  ),
  'TDA-4': c(
    'Se evalúa si el sistema verifica que las transacciones completadas coincidan con lo programado, y notifica errores a clientes o gestores de cuenta.',
    'Sin esta verificación, una transacción fallida o incorrecta podría pasar sin que nadie se entere hasta que el cliente reclame.',
    'Cargar capturas del tablero de alertas operativas mostrando validación de transacciones.',
  ),

  // --- Gestión de Activos ---
  'AST-1': c(
    'Se evalúa si los medios electrónicos con información confidencial se destruyen de forma segura al darlos de baja, con certificado de destrucción.',
    'Un disco o dispositivo dado de baja sin borrado seguro puede terminar en manos de terceros con toda la información confidencial todavía recuperable.',
    'Cargar evidencia de disposición segura de medios/dispositivos y la Política de Gestión de Activos aprobada.',
  ),
  'AST-2': c(
    'Se evalúa si existen procedimientos formales que definan cuánto tiempo se retienen los datos y cómo se eliminan de forma segura.',
    'Sin reglas claras de retención, los datos se acumulan indefinidamente (aumentando el impacto de una filtración) o se borran de forma inconsistente (perdiendo información que sí se necesitaba).',
    'Cargar la Política de Gestión de Datos aprobada, con evidencia de aceptación por parte de los empleados.',
  ),
  'AST-3': c(
    'Se evalúa si la empresa mantiene un inventario formal y actualizado de los activos de su entorno de producción.',
    'No se puede proteger, parchar ni dar de baja de forma segura un activo que no se sabe que existe — el inventario es la base de cualquier programa de seguridad.',
    'Cargar el inventario actual de activos de producción.',
  ),

  // --- Gestión de Cambios ---
  'CHG-1': c(
    'Se evalúa si los cambios de software e infraestructura se autorizan, documentan, prueban y aprueban formalmente antes de llegar a producción.',
    'Un cambio no controlado en producción es una de las causas más comunes de incidentes — el proceso formal reduce errores y deja trazabilidad de quién aprobó qué.',
    'Cargar evidencia del sistema CI/CD en uso y de al menos un cambio siguiendo el flujo de aprobación completo.',
  ),
  'CHG-2': c(
    'Se evalúa si solo personal autorizado puede desplegar cambios directamente a producción.',
    'Si cualquier desarrollador pudiera desplegar directo a producción sin pasar por una aprobación, el proceso de gestión de cambios completo perdería su valor de control.',
    'Cargar evidencia de la restricción de acceso a despliegues de producción (por ejemplo, configuración de permisos del pipeline de CI/CD).',
  ),
  'CHG-3': c(
    'Se evalúa si existe una metodología formal de ciclo de vida de desarrollo (SDLC) que cubra desarrollo, cambios, cambios de emergencia y mantenimiento.',
    'Sin una metodología documentada, cada desarrollador o equipo puede seguir su propio proceso (o ninguno), generando inconsistencias que derivan en errores o brechas de seguridad.',
    'Cargar el documento de metodología SDLC de la empresa.',
  ),

  // --- Gestión de Configuración ---
  'CFG-1': c(
    'Se evalúa si existe un procedimiento de gestión de configuración que asegure que las configuraciones se despliegan de forma consistente en todo el entorno.',
    'Servidores configurados de forma distinta entre sí (aunque deban ser iguales) generan comportamientos impredecibles y dificultan detectar cuál configuración es la insegura.',
    'Cargar evidencia del sistema CI/CD o de gestión de configuración en uso.',
  ),

  // --- Gestión de Proyectos y Recursos ---
  'PRM-1': c(
    'Se evalúa si los compromisos de seguridad de la empresa se comunican a los clientes en contratos (MSA) o términos de servicio.',
    'Sin compromisos explícitos por escrito, un cliente no tiene forma de exigir el nivel de seguridad que asume que está recibiendo.',
    'Cargar la plantilla de Contrato Marco de Servicio (MSA), la página de información de seguridad, y los Términos de Servicio publicados.',
  ),
  'PRM-2': c(
    'Se evalúa si la empresa ofrece a sus clientes recursos y soporte técnico sobre la operación del sistema.',
    'Sin canales de soporte claros, los clientes no tienen a quién acudir ante un problema, lo que puede derivar en incidentes que se agravan por falta de comunicación oportuna.',
    'Cargar evidencia del sitio o canal de soporte al cliente y el registro público de cambios/notas de versión.',
  ),
  'PRM-3': c(
    'Se evalúa si la empresa comunica de forma clara la descripción de sus productos y servicios a usuarios internos y externos.',
    'Sin una descripción clara del servicio, es difícil para clientes y auditores entender qué alcance tienen realmente los controles de seguridad implementados.',
    'Cargar un diagrama de red y el sitio de documentación del producto.',
  ),

  // --- Gestión de Riesgos ---
  'RSK-1': c(
    'Se evalúa si la empresa tiene definidos objetivos claros que permitan identificar y evaluar los riesgos relacionados con ellos.',
    'Sin objetivos claros, no hay una vara con la cual medir si un riesgo es relevante o no — la evaluación de riesgos se vuelve subjetiva y poco consistente.',
    'Cargar la Política de Gestión de Riesgos aprobada, donde se documenten esos objetivos.',
  ),
  'RSK-2': c(
    'Se evalúa si la empresa realiza evaluaciones formales de riesgo al menos una vez al año, incluyendo el riesgo de fraude.',
    'El entorno de amenazas, regulatorio y tecnológico cambia constantemente — una evaluación de riesgos desactualizada puede dejar a la empresa ciega ante riesgos nuevos y reales.',
    'Cargar el reporte de la última evaluación de riesgos realizada.',
  ),
  'RSK-3': c(
    'Se evalúa si existe un programa documentado de gestión de riesgos, con lineamientos de identificación, calificación y mitigación.',
    'Sin un programa formal, la gestión de riesgos depende de la memoria e iniciativa individual de alguien, en vez de ser un proceso repetible de la empresa.',
    'Cargar la Política de Gestión de Riesgos aprobada, con evidencia de aceptación por parte de los empleados.',
  ),

  // --- Gestión de Terceros ---
  'TPM-1': c(
    'Se evalúa si existen acuerdos escritos con proveedores y terceros que incluyan compromisos de confidencialidad y privacidad.',
    'Sin un acuerdo formal, la empresa no tiene forma de exigir legalmente a un tercero que proteja los datos que comparte con él.',
    'Cargar el contrato del proveedor de nube y las políticas de privacidad/términos de servicio de los terceros relevantes.',
  ),
  'TPM-2': c(
    'Se evalúa si existe un programa de gestión de proveedores, con inventario de terceros críticos y revisión anual de sus riesgos.',
    'Un proveedor con acceso a datos o sistemas de la empresa es, en la práctica, una extensión de su superficie de riesgo — si nadie lo vigila, ese riesgo queda sin controlar.',
    'Cargar la Política de Gestión de Terceros aprobada, con evidencia de aceptación, y el inventario de proveedores críticos.',
  ),

  // --- Gestión de Vulnerabilidades y Parches ---
  'VPM-1': c(
    'Se evalúa si la infraestructura que soporta el servicio recibe parches de forma rutinaria y en respuesta a vulnerabilidades identificadas.',
    'Un servidor sin parchar es un blanco fácil — la mayoría de los ataques exitosos explotan vulnerabilidades ya conocidas y para las que ya existe un parche disponible.',
    'Cargar una muestra de vulnerabilidades remediadas y el último escaneo de vulnerabilidades realizado.',
  ),
  'VPM-2': c(
    'Se evalúa si se realizan escaneos de vulnerabilidades al menos trimestralmente en los sistemas expuestos a internet, y si las críticas/altas se remedian.',
    'Los sistemas expuestos a internet son el primer punto de contacto para un atacante — sin escaneos periódicos, una vulnerabilidad crítica podría quedar expuesta durante meses sin que nadie lo sepa.',
    'Cargar una muestra de vulnerabilidades remediadas y el reporte del último escaneo de vulnerabilidades.',
  ),

  // --- Gobierno de Seguridad y Privacidad ---
  'GOV-1': c(
    'Se evalúa si el consejo de administración recibe al menos una vez al año información sobre el estado del riesgo de ciberseguridad y privacidad.',
    'Sin visibilidad al más alto nivel, las decisiones sobre inversión en seguridad quedan libradas al criterio de niveles operativos, sin el respaldo ni la rendición de cuentas que da la supervisión del consejo.',
    'Cargar las actas y la agenda de la última reunión del consejo donde se trató el tema de riesgo de ciberseguridad/privacidad.',
  ),
  'GOV-10': c(
    'Se evalúa si los roles y responsabilidades de seguridad de la información están formalmente asignados en descripciones de puesto o en una política.',
    'Si nadie tiene asignada formalmente la responsabilidad de una función de seguridad, en la práctica esa función no la hace nadie cuando surge un problema.',
    'Cargar las descripciones de puesto de los roles clave de seguridad de la información.',
  ),
  'GOV-11': c(
    'Se evalúa si las políticas y procedimientos de seguridad de la información están documentados y se revisan al menos una vez al año.',
    'Una política que nunca se revisa queda desactualizada frente a nuevas amenazas, nueva tecnología o cambios en la empresa, perdiendo utilidad real.',
    'Cargar evidencia de la revisión anual de las políticas de seguridad (fecha de última actualización, historial de versiones).',
  ),
  'GOV-12': c(
    'Se evalúa si existe un sistema de soporte externo donde los usuarios puedan reportar fallas, incidentes o quejas.',
    'Sin un canal claro para reportar problemas, un incidente detectado por un cliente puede tardar en llegar a quien puede resolverlo, agravando el impacto.',
    'Cargar evidencia del sitio de soporte al cliente o alias de correo, y el registro público de cambios/notas de versión.',
  ),
  'GOV-13': c(
    'Se evalúa si los cambios del sistema se comunican a los usuarios internos autorizados.',
    'Un cambio del que nadie avisa puede tomar por sorpresa a otros equipos que dependen de ese sistema, generando errores operativos evitables.',
    'Cargar evidencia de una comunicación interna reciente sobre una actualización del sistema.',
  ),
  'GOV-2': c(
    'Se evalúa si el consejo de administración cuenta con un estatuto documentado que defina sus responsabilidades de supervisión del control interno.',
    'Sin un estatuto claro, la supervisión del consejo sobre los controles de la empresa queda mal definida y es difícil exigir rendición de cuentas.',
    'Cargar el estatuto documentado del consejo de administración.',
  ),
  'GOV-3': c(
    'Se evalúa si los miembros del consejo tienen experiencia suficiente para supervisar los controles de seguridad de la información, apoyándose en expertos externos si es necesario.',
    'Un consejo sin criterio técnico suficiente no puede hacer preguntas correctas ni detectar cuando la dirección está subestimando un riesgo real.',
    'Cargar los currículums (CV) de los miembros del consejo y el estatuto del consejo.',
  ),
  'GOV-4': c(
    'Se evalúa si el consejo de administración se reúne al menos una vez al año, con actas formales, e incluye consejeros independientes.',
    'Sin reuniones documentadas ni independencia, la supervisión del consejo puede volverse una formalidad sin sustancia real.',
    'Cargar las actas y la agenda de las reuniones del consejo del último año.',
  ),
  'GOV-5': c(
    'Se evalúa si la política de respaldo de datos documenta los requisitos de respaldo y recuperación de los datos de los clientes.',
    'Sin requisitos documentados, cada equipo puede interpretar "hacer respaldo" de forma distinta, dejando huecos que solo se descubren cuando ya se necesita restaurar algo.',
    'Cargar evidencia del último ejercicio de simulación (tabletop) de recuperación ante desastres.',
  ),
  'GOV-6': c(
    'Se evalúa si la empresa notifica a los clientes sobre cambios críticos del sistema que puedan afectar su procesamiento.',
    'Un cliente que no sabe que un cambio va a afectar su operación no puede prepararse, aumentando el impacto real del cambio sobre su negocio.',
    'Cargar evidencia del sitio de soporte al cliente y el registro público de cambios/notas de versión.',
  ),
  'GOV-7': c(
    'Se evalúa si la dirección tiene definidos roles y responsabilidades claros para supervisar el diseño e implementación de los controles de seguridad.',
    'Sin responsables claros a nivel de dirección, decisiones importantes de seguridad pueden quedar sin dueño, retrasando su implementación.',
    'Documentar los roles y responsabilidades de la dirección respecto a la supervisión de seguridad de la información.',
  ),
  'GOV-8': c(
    'Se evalúa si la empresa mantiene un organigrama actualizado que describa su estructura y líneas de reporte.',
    'Sin un organigrama claro, es difícil saber quién es responsable de qué, complicando la rendición de cuentas ante cualquier hallazgo o incidente.',
    'Cargar el organigrama actual de la empresa.',
  ),
  'GOV-9': c(
    'Se evalúa si los clientes pueden recibir alertas por correo sobre transacciones o modificaciones en su cuenta.',
    'Sin alertas al cliente, un uso indebido de su cuenta podría pasar desapercibido para él mismo durante mucho tiempo.',
    'Cargar evidencia de alertas de actividad de cuenta enviadas a clientes.',
  ),

  // --- Identificación y Autenticación ---
  'IAC-1': c(
    'Se evalúa si el acceso a la aplicación de producción está restringido únicamente a personal autorizado.',
    'Un acceso demasiado amplio a producción multiplica el número de personas que podrían, por error o mala intención, afectar el sistema o exponer datos de clientes.',
    'Cargar evidencia de la política de control de acceso o de la configuración de permisos de acceso a producción.',
  ),
  'IAC-2': c(
    'Se evalúa si existe una política de control de acceso que documente cómo se otorga, modifica y revoca el acceso de los usuarios.',
    'Sin un proceso documentado, el otorgamiento y revocación de accesos depende de la memoria de una persona, generando accesos olvidados que nadie revoca a tiempo.',
    'Cargar evidencia de un ticket o historial de solicitud de acceso siguiendo el proceso documentado.',
  ),
  'IAC-4': c(
    'Se evalúa si el acceso privilegiado al firewall está restringido a usuarios autorizados con una necesidad de negocio real.',
    'El firewall es la primera línea de defensa de la red — si demasiadas personas pueden modificarlo, un solo error o cuenta comprometida puede abrir la red completa.',
    'Cargar evidencia de quiénes tienen acceso privilegiado al firewall y por qué.',
  ),
  'IAC-5': c(
    'Se evalúa si el acceso privilegiado al sistema operativo de los servidores de producción está restringido a usuarios autorizados con necesidad de negocio.',
    'Cuantas más personas tengan acceso administrativo a un servidor, mayor la probabilidad de un error de configuración o de que una cuenta comprometida cause daño real.',
    'Cargar la Política de Control de Acceso aprobada.',
  ),
  'IAC-7': c(
    'Se evalúa si se realizan revisiones de acceso al menos trimestralmente, dando seguimiento a los cambios que resulten necesarios.',
    'Los accesos otorgados en el pasado (a alguien que cambió de rol, o que ya no debería tenerlo) tienden a acumularse si nadie los revisa periódicamente — es una de las causas más comunes de accesos excesivos.',
    'Cargar la evidencia de la última revisión de acceso completada.',
  ),
  'IAC-8': c(
    'Se evalúa si el acceso de un empleado se revoca dentro del plazo acordado al finalizar su relación laboral.',
    'Un acceso que no se revoca a tiempo tras la salida de un empleado es una de las formas más comunes de acceso no autorizado — el riesgo es real y bien documentado en incidentes de la industria.',
    'Cargar la lista de verificación de baja del empleado y la política de seguridad para bajas.',
  ),
  'IAC-9': c(
    'Se evalúa si el acceso de los usuarios se basa en su rol, o requiere una solicitud formal con aprobación del gerente antes de otorgarse.',
    'Sin un proceso formal de solicitud y aprobación, cualquiera podría terminar con más acceso del que su función realmente requiere.',
    'Cargar el ticket o historial de una solicitud de acceso reciente siguiendo el proceso formal.',
  ),

  // --- Monitoreo Continuo ---
  'MON-1': c(
    'Se evalúa si la empresa usa un sistema de detección de intrusiones que monitoree la red de forma continua.',
    'Sin detección de intrusiones, un atacante que logre entrar a la red podría moverse sin ser detectado durante días o semanas.',
    'Cargar evidencia de la instalación y configuración del sistema de detección de intrusiones.',
  ),
  'MON-2': c(
    'Se evalúa si la empresa usa una herramienta de gestión de registros (logs) para identificar eventos que puedan afectar sus objetivos de seguridad.',
    'Sin centralizar y analizar los registros, eventos importantes pueden quedar dispersos en distintos sistemas sin que nadie los correlacione a tiempo.',
    'Cargar evidencia de la herramienta de gestión de logs en uso (dashboard, configuración).',
  ),
  'MON-3': c(
    'Se evalúa si el sistema valida las entradas de datos de procesamiento y genera alertas cuando hay un problema.',
    'Sin esta validación, datos incorrectos o corruptos podrían procesarse sin que nadie lo note, afectando la integridad de la información del cliente.',
    'Cargar evidencia (captura) de una alerta de validación de entradas generada por el sistema.',
  ),
  'MON-4': c(
    'Se evalúa si el rendimiento e infraestructura del sistema se monitorean con alertas automáticas ante umbrales predefinidos.',
    'Sin monitoreo de rendimiento, un problema de capacidad podría degradar el servicio gradualmente hasta convertirse en una caída total, sin ninguna alerta previa.',
    'Cargar evidencia (captura) del monitoreo de infraestructura y sus alertas configuradas.',
  ),

  // --- Operaciones de Seguridad ---
  'OPS-1': c(
    'Se evalúa si existen políticas formales que definan los requisitos de gestión de vulnerabilidades y monitoreo de sistemas del área de TI/Ingeniería.',
    'Sin políticas formales, cada persona del equipo técnico puede tener un criterio distinto sobre qué tan seguido escanear o monitorear, dejando huecos de cobertura.',
    'Cargar las políticas formales de gestión de vulnerabilidades y monitoreo de sistemas.',
  ),

  // --- Planificación de Capacidad y Rendimiento ---
  'CAP-1': c(
    'Se evalúa si la empresa revisa la capacidad del sistema de forma continua e implementa cambios para que el procesamiento satisfaga la demanda.',
    'Un sistema sin planificación de capacidad puede colapsar en un pico de demanda inesperado, afectando a todos los clientes al mismo tiempo.',
    'Cargar evidencia de alertas automáticas de capacidad habilitadas y la Política de Seguridad de Operaciones aprobada.',
  ),

  // --- Privacidad ---
  'PRI-10': c(
    'Se evalúa si la empresa obtiene y documenta el consentimiento del individuo antes de recolectar sus datos personales.',
    'Recolectar datos personales sin consentimiento documentado expone a la empresa a sanciones regulatorias y erosiona la confianza del usuario.',
    'Cargar la política de privacidad y los términos de servicio publicados públicamente.',
  ),
  'PRI-11': c(
    'Se evalúa si, cuando se le da una nueva finalidad a información ya recolectada, se notifica al individuo y se obtiene su consentimiento para ese nuevo uso.',
    'Usar datos personales para un fin distinto al que la persona autorizó originalmente es, en muchas jurisdicciones, una infracción directa a la ley de protección de datos.',
    'Cargar la política de privacidad publicada, donde se documenten las finalidades del tratamiento de datos.',
  ),
  'PRI-12': c(
    'Se evalúa si los usuarios pueden aceptar o rechazar cookies no esenciales, y si la empresa respeta esa elección.',
    'Instalar cookies sin consentimiento (cuando no son estrictamente necesarias) es una de las infracciones de privacidad más comunes y sancionadas.',
    'Cargar evidencia del gestor de consentimiento de cookies y la Política de Cookies.',
  ),
  'PRI-13': c(
    'Se evalúa si las políticas de manejo de información personal se revisan y actualizan cuando hay cambios, distinguiendo qué información es esencial u opcional.',
    'Una política de privacidad desactualizada puede describir prácticas que ya no reflejan lo que realmente hace la empresa con los datos, exponiéndola legalmente.',
    'Cargar la política de privacidad publicada y vigente.',
  ),
  'PRI-14': c(
    'Se evalúa si la política de privacidad está disponible para clientes, empleados y terceros antes de que se les recolecte información.',
    'Sin acceso previo a la política, un individuo no puede tomar una decisión informada sobre si compartir o no su información.',
    'Cargar el enlace o documento de la política de privacidad publicada públicamente.',
  ),
  'PRI-15': c(
    'Se evalúa si la política de privacidad documenta claramente qué información se recolecta, las obligaciones de la empresa, los derechos del individuo y un punto de contacto.',
    'Una política vaga o incompleta no cumple con el estándar mínimo que exigen la mayoría de las leyes de protección de datos, y deja a los usuarios sin saber cómo ejercer sus derechos.',
    'Cargar la política de privacidad publicada, verificando que cubra todos los elementos requeridos.',
  ),
  'PRI-16': c(
    'Se evalúa si la política de privacidad se revisa cuando es necesario o cuando hay cambios, para mantenerla alineada con leyes y regulaciones vigentes.',
    'Las leyes de protección de datos cambian con frecuencia — una política que no se actualiza puede quedar fuera de cumplimiento sin que nadie lo note hasta una auditoría o denuncia.',
    'Cargar evidencia de la fecha de última revisión de la política de privacidad.',
  ),
  'PRI-17': c(
    'Se evalúa si se documenta y revisa al menos una vez al año qué información personal se comparte con terceros, y con qué alcance y finalidad.',
    'Compartir datos personales con terceros sin documentar el alcance y la finalidad dificulta demostrar cumplimiento ante un auditor o una autoridad de protección de datos.',
    'Cargar la política de privacidad, los términos de servicio y la Política de Gestión de Terceros aprobada.',
  ),
  'PRI-2': c(
    'Se evalúa si los individuos pueden actualizar su información personal (por portal o contactando a la empresa) para mantenerla precisa y completa.',
    'Sin un mecanismo de actualización, información desactualizada o incorrecta puede quedar asociada a una persona indefinidamente, generando errores o problemas legales.',
    'Cargar la política de privacidad donde se describa el mecanismo de actualización de datos.',
  ),
  'PRI-3': c(
    'Se evalúa si se avisa a los individuos antes de recolectar su información o de darle un nuevo uso no informado previamente.',
    'Recolectar o reutilizar información personal sin avisar previamente es una práctica que la mayoría de las regulaciones de privacidad prohíben explícitamente.',
    'Cargar la política de privacidad publicada donde se documenten los avisos correspondientes.',
  ),
  'PRI-4': c(
    'Se evalúa si la dirección o el área legal revisa y aprueba los métodos de recolección de información personal antes de implementarlos.',
    'Sin esta revisión previa, un equipo técnico podría implementar una forma de recolectar datos que sea legalmente riesgosa sin que nadie con criterio legal la haya evaluado antes.',
    'Cargar evidencia del mapa de inventario de datos mantenido por la empresa.',
  ),
  'PRI-5': c(
    'Se evalúa si la dirección revisa y aprueba las fuentes externas (terceros) de información personal, para asegurar que sean confiables.',
    'Si un tercero recolectó los datos de forma indebida, la empresa que los recibe hereda ese riesgo legal y reputacional al usarlos.',
    'Cargar evidencia del mapa de inventario de datos, identificando las fuentes de terceros.',
  ),
  'PRI-6': c(
    'Se evalúa si la política de privacidad está escrita en lenguaje claro, fechada, y cubre todos los elementos que exige un aviso de privacidad completo (jurisdicciones, derechos del individuo, tipos de datos, fuentes, terceros, etc.).',
    'Una política escrita en lenguaje legal denso, o incompleta, no cumple su propósito real: que la persona entienda qué pasa con su información.',
    'Cargar la política de privacidad publicada, verificando que cubra todos los elementos requeridos.',
  ),
  'PRI-7': c(
    'Se evalúa si existen procedimientos documentados para atender quejas de privacidad, dar seguimiento a su resolución y comunicarla al individuo.',
    'Una queja de privacidad sin un proceso claro de atención puede quedar sin resolver, generando una denuncia formal ante una autoridad de protección de datos.',
    'Cargar la política de privacidad publicada donde se describa el proceso de atención de quejas.',
  ),
  'PRI-8': c(
    'Se evalúa si los requisitos de retención de información personal están documentados y se cumplen conforme a fines de negocio o exigencias legales.',
    'Retener información personal más tiempo del necesario o legalmente permitido aumenta el riesgo e impacto de una eventual filtración de datos.',
    'Cargar la política de privacidad donde se documenten los requisitos de retención.',
  ),
  'PRI-9': c(
    'Se evalúa si se obtiene y conserva consentimiento explícito antes de recolectar, usar o divulgar información sensible.',
    'La información sensible (salud, datos financieros, biométricos, etc.) tiene un estándar de protección legal más alto — recolectarla sin consentimiento explícito es una infracción grave.',
    'Cargar evidencia del gestor de consentimiento de cookies, la Política de Cookies y el mapa de inventario de datos.',
  ),

  // --- Protecciones Criptográficas ---
  'CRY-2': c(
    'Se evalúa si el acceso privilegiado a las claves de cifrado está restringido a usuarios autorizados con necesidad de negocio real.',
    'Quien tenga acceso a las claves de cifrado puede, en la práctica, leer todo lo que esas claves protegen — restringir ese acceso es tan importante como el cifrado mismo.',
    'Cargar evidencia de quiénes tienen acceso privilegiado a las claves de cifrado y por qué.',
  ),
  'CRY-3': c(
    'Se evalúa si los dispositivos de medios portátiles y extraíbles se cifran cuando se utilizan.',
    'Un dispositivo portátil sin cifrar (USB, disco externo) expone toda su información si se pierde o es robado.',
    'Cargar evidencia de la configuración de cifrado de medios extraíbles.',
  ),

  // --- Respuesta a Incidentes ---
  'IRO-1': c(
    'Se evalúa si el plan de respuesta a incidentes se pone a prueba al menos una vez al año.',
    'Un plan de respuesta a incidentes que nunca se practica suele fallar en la práctica — los roles no están claros y el tiempo de reacción real es mucho mayor al esperado.',
    'Cargar el reporte de un incidente o análisis de causa raíz reciente, y la evidencia de la última prueba del plan.',
  ),
  'IRO-2': c(
    'Se evalúa si existen políticas y procedimientos de respuesta a incidentes de seguridad y privacidad, documentados y comunicados.',
    'Sin un procedimiento documentado, cada incidente se manejaría de forma improvisada, aumentando el tiempo de respuesta y el riesgo de errores durante la crisis.',
    'Cargar la política de respuesta a incidentes de seguridad y privacidad.',
  ),
  'IRO-3': c(
    'Se evalúa si los incidentes de seguridad y privacidad se registran, gestionan, resuelven y comunican a las partes afectadas.',
    'Un incidente que no se documenta ni se comunica a los afectados no permite aprender de él ni cumplir obligaciones legales de notificación.',
    'Cargar evidencia del registro y gestión de un incidente reciente, siguiendo la política correspondiente.',
  ),
  'IRO-4': c(
    'Se evalúa si la empresa entrega información personal solicitada por un individuo, previa verificación, en un formato accesible y dentro de un plazo razonable.',
    'La mayoría de las leyes de protección de datos otorgan a las personas el derecho a solicitar copia de su propia información — no poder cumplirlo es una infracción directa.',
    'Cargar la política de privacidad donde se describa el proceso de atención de estas solicitudes.',
  ),

  // --- Seguridad de Redes ---
  'NET-1': c(
    'Se evalúa si los datos confidenciales se cifran al transmitirse por redes públicas, usando protocolos seguros.',
    'Datos sin cifrar en tránsito por una red pública pueden ser interceptados por cualquiera con acceso a esa red (ataques de "hombre en el medio").',
    'Cargar evidencia de los protocolos de cifrado en tránsito utilizados (por ejemplo, configuración TLS).',
  ),
  'NET-2': c(
    'Se evalúa si la red de la empresa está segmentada para evitar el acceso no autorizado a los datos de clientes.',
    'Sin segmentación, un atacante que comprometa cualquier parte de la red puede moverse libremente hasta llegar a los sistemas más sensibles.',
    'Cargar evidencia de la segmentación de red implementada (diagramas, configuración de VLANs/subredes).',
  ),
  'NET-3': c(
    'Se evalúa si las reglas del firewall se revisan al menos una vez al año, dando seguimiento a los cambios necesarios.',
    'Las reglas de firewall tienden a acumularse con el tiempo (reglas viejas que ya nadie necesita, excepciones olvidadas) — sin revisión periódica, terminan dejando accesos innecesarios abiertos.',
    'Cargar evidencia de la última revisión anual del firewall.',
  ),
  'NET-4': c(
    'Se evalúa si la empresa usa firewalls configurados para prevenir el acceso no autorizado a su red.',
    'Sin firewall, cualquier servicio expuesto en la red queda accesible directamente desde internet, sin ningún filtro de por medio.',
    'Cargar evidencia de la configuración del firewall en uso.',
  ),
  'NET-5': c(
    'Se evalúa si existen estándares documentados de fortalecimiento (hardening) de red y sistemas, basados en mejores prácticas y revisados al menos una vez al año.',
    'Sin estándares documentados, cada servidor podría configurarse de forma distinta, dependiendo del criterio de quien lo instaló, dejando algunos más expuestos que otros.',
    'Cargar el documento de estándares de hardening de red y sistemas.',
  ),

  // --- Seguridad en Recursos Humanos ---
  'HRS-1': c(
    'Se evalúa si se realizan verificaciones de antecedentes a los nuevos empleados antes o al momento de su contratación.',
    'Contratar sin verificar antecedentes puede dar acceso a sistemas y datos sensibles a alguien con un historial que la empresa desconoce.',
    'Cargar evidencia de verificaciones de antecedentes completadas y la Política de Seguridad en Recursos Humanos aprobada.',
  ),
  'HRS-2': c(
    'Se evalúa si los acuerdos con contratistas incluyen un código de conducta o referencia a él.',
    'Un contratista sin código de conducta explícito no tiene un estándar claro de comportamiento exigible por contrato.',
    'Cargar un acuerdo con contratista donde se incluya el código de conducta.',
  ),
  'HRS-3': c(
    'Se evalúa si los empleados reconocen un código de conducta al ser contratados y si su incumplimiento tiene consecuencias disciplinarias.',
    'Sin un código de conducta reconocido formalmente, es más difícil sancionar comportamientos indebidos de forma consistente y justificada.',
    'Cargar la Política de Seguridad en Recursos Humanos y el Código de Conducta, ambos con evidencia de aceptación del empleado.',
  ),
  'HRS-4': c(
    'Se evalúa si los contratistas firman un acuerdo de confidencialidad al ser contratados.',
    'Un contratista sin acuerdo de confidencialidad firmado no tiene una obligación legal clara de proteger la información a la que accede.',
    'Cargar un acuerdo de contratista que incluya el compromiso de confidencialidad.',
  ),
  'HRS-5': c(
    'Se evalúa si los empleados firman un acuerdo de confidencialidad durante su proceso de incorporación (onboarding).',
    'Sin este acuerdo firmado, la empresa tiene menos respaldo legal si un empleado divulga información confidencial indebidamente.',
    'Cargar el acuerdo de empleado y el acuerdo de confidencialidad firmado.',
  ),
  'HRS-6': c(
    'Se evalúa si los gerentes completan evaluaciones de desempeño de su equipo al menos una vez al año.',
    'Sin evaluaciones periódicas, es difícil identificar y corregir a tiempo comportamientos de riesgo o bajo desempeño relacionados con el cumplimiento de políticas.',
    'Cargar evidencia de evaluaciones de desempeño completadas.',
  ),

  // --- Seguridad Física y Ambiental ---
  'PES-1': c(
    'Se evalúa si existen procesos para otorgar, modificar y revocar el acceso físico a los centros de datos, con autorización formal.',
    'Sin un proceso formal, el acceso físico a donde viven los servidores podría otorgarse de forma informal y nunca revocarse cuando ya no se necesita.',
    'Documentar el proceso de otorgamiento, modificación y revocación de acceso físico a centros de datos.',
  ),
  'PES-2': c(
    'Se evalúa si el acceso físico a los centros de datos se revisa al menos una vez al año.',
    'Igual que el acceso lógico, el acceso físico otorgado en el pasado tiende a acumularse si nadie lo revisa — alguien que ya no debería entrar, sigue pudiendo hacerlo.',
    'Cargar evidencia de la última revisión de acceso físico a centros de datos.',
  ),
  'PES-3': c(
    'Se evalúa si los visitantes deben registrarse, portar una credencial y ser acompañados por un empleado autorizado al entrar al centro de datos.',
    'Un visitante sin supervisión en un área con equipos sensibles podría, intencional o accidentalmente, comprometer la seguridad física del lugar.',
    'Documentar el procedimiento de registro y acompañamiento de visitantes.',
  ),
  'PES-4': c(
    'Se evalúa si hay dispositivos de monitoreo ambiental (temperatura, humedad, humo, agua) que alerten automáticamente ante incidentes.',
    'Un problema ambiental no detectado a tiempo (sobrecalentamiento, incendio, inundación) puede dañar físicamente el equipo y causar pérdida de datos o del servicio.',
    'Documentar los dispositivos de monitoreo ambiental instalados y su configuración de alertas.',
  ),
  'PES-5': c(
    'Se evalúa si se realizan inspecciones de mantenimiento de las medidas de seguridad ambiental de los centros de datos al menos una vez al año.',
    'Equipos de protección ambiental (extintores, detectores, sistemas de enfriamiento) que no se inspeccionan pueden fallar justo cuando se necesitan.',
    'Cargar evidencia de la última inspección de seguridad ambiental realizada.',
  ),
};

async function main() {
  const apply = process.argv.includes('--apply');
  const dbArg = process.argv.find((a) => a.startsWith('--db='));
  const urlArg = process.argv.find((a) => a.startsWith('--tenant-db-url='));

  let connectionString: string;
  let label: string;
  if (urlArg) {
    connectionString = urlArg.split('=').slice(1).join('=');
    label = 'tenant';
  } else if (dbArg?.split('=')[1] === 'central') {
    connectionString = process.env.CENTRAL_DATABASE_URL!;
    label = 'central';
  } else {
    throw new Error('Pasa --db=central o --tenant-db-url="postgresql://..."');
  }

  const pool = new Pool({ connectionString });

  const items = (await pool.query(`
    SELECT mci.id, ctl.source_ref, ctl.name
    FROM mnk_manual_check_items mci
    JOIN mnk_controls ctl ON ctl.id = mci.control_id
    WHERE mci.dimension = 'POLICY'
  `)).rows;

  console.log(`[${label}] ManualCheckItem (POLICY) encontrados: ${items.length}`);
  const covered = items.filter((i) => CONTENT[i.source_ref]);
  const missing = items.filter((i) => !CONTENT[i.source_ref]);
  console.log(`Cubiertos por este script: ${covered.length}`);
  if (missing.length) console.log(`⚠️  SIN cubrir: ${missing.map((i) => `${i.source_ref} (${i.name})`).join(', ')}`);

  if (!apply) {
    console.log('\n[DRY-RUN] Corré con --apply para escribir de verdad.');
    await pool.end();
    return;
  }

  let written = 0;
  for (const item of covered) {
    const content = CONTENT[item.source_ref];
    await pool.query(
      `UPDATE mnk_manual_check_items SET description = $1, rationale = $2, remediation = $3 WHERE id = $4`,
      [content.description, content.rationale, content.remediation, item.id],
    );
    written++;
  }
  console.log(`\n✅ ${written} ManualCheckItem actualizados en [${label}].`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
