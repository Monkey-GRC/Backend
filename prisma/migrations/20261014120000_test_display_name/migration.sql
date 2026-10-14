-- MD-117 · El nombre neutro de un test (D70). El texto del comité (`name`) puede nombrar al proveedor del motor y no sale al cliente: lo que se muestra es
-- este nombre, que escribe Monkey. Mientras un test no lo tenga, la API usa un texto genérico por dimensión. Es nullable a propósito: se carga como dato.
ALTER TABLE "catalog"."tests" ADD COLUMN "display_name" TEXT;
