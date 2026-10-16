-- D82 · La descripción corta de un test, la que ve el cliente junto a su nombre neutro (D70). El objetivo del comité (`objective`) puede nombrar al proveedor del motor y no sale al cliente:
-- lo que se muestra es esta descripción, que es el objetivo o su reescritura. Es nullable a propósito: se carga como dato (`catalog:load`), no en la migración.
ALTER TABLE "catalog"."tests" ADD COLUMN "display_description" TEXT;
