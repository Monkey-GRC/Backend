// Una imagen que viaja DENTRO del correo y se referencia en el HTML como `<img src="cid:<cid>">`. Se ve aunque el cliente bloquee las imágenes remotas y aunque la dirección de la app
// no sea pública (en local); por eso el logo va así y no como una URL.
export type InlineImage = {
  cid: string;
  filename: string;
  contentType: string;
  contentBase64: string;
};

export type MailMessage = {
  to: string;
  subject: string;
  // Versión en texto: es la que leen los clientes sin HTML y la que queda en el log local.
  text: string;
  // Versión maquetada (opcional). Siempre acompaña al texto, nunca lo reemplaza.
  html?: string;
  inlineImages?: InlineImage[];
  // El cuerpo lleva un secreto de un solo uso (p. ej. un código de activación, SEG-75). Ningún adaptador que registre mensajes debe escribir el cuerpo.
  confidential?: boolean;
};

// Puerto del correo saliente (D99). Lo implementa la infraestructura; los casos de uso solo conocen esta
// abstracción, de modo que el servicio que entrega el mensaje se cambia sin tocar la lógica.
export abstract class Mailer {
  // Lanza si el servicio no aceptó el mensaje. Quien llama decide qué hacer con el fallo; el error nunca
  // debe llevar el cuerpo del mensaje (puede traer una clave).
  abstract send(message: MailMessage): Promise<void>;
}
