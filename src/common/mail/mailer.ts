export type MailMessage = {
  to: string;
  subject: string;
  // Versión en texto: es la que leen los clientes sin HTML y la que queda en el log local.
  text: string;
  // Versión maquetada (opcional). Siempre acompaña al texto, nunca lo reemplaza.
  html?: string;
};

// Puerto del correo saliente (D99). Lo implementa la infraestructura; los casos de uso solo conocen esta
// abstracción, de modo que el servicio que entrega el mensaje se cambia sin tocar la lógica.
export abstract class Mailer {
  // Lanza si el servicio no aceptó el mensaje. Quien llama decide qué hacer con el fallo; el error nunca
  // debe llevar el cuerpo del mensaje (puede traer una clave).
  abstract send(message: MailMessage): Promise<void>;
}
