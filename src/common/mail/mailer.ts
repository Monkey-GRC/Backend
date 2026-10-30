export type MailMessage = {
  to: string;
  subject: string;
  // Solo texto: lo que viaja es una clave de un solo uso, no hace falta maquetar nada.
  text: string;
};

// Puerto del correo saliente (D99). Lo implementa la infraestructura; los casos de uso solo conocen esta
// abstracción, de modo que el servicio que entrega el mensaje se cambia sin tocar la lógica.
export abstract class Mailer {
  // Lanza si el servicio no aceptó el mensaje. Quien llama decide qué hacer con el fallo; el error nunca
  // debe llevar el cuerpo del mensaje (puede traer una clave).
  abstract send(message: MailMessage): Promise<void>;
}
