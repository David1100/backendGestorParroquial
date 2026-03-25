-- CreateTable
CREATE TABLE "Parroquia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "ciudad" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parroquia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "perfilId" INTEGER NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perfil" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permiso" (
    "id" SERIAL NOT NULL,
    "perfilId" INTEGER NOT NULL,
    "modulo" TEXT NOT NULL,
    "ver" BOOLEAN NOT NULL DEFAULT false,
    "crear" BOOLEAN NOT NULL DEFAULT false,
    "editar" BOOLEAN NOT NULL DEFAULT false,
    "eliminar" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bautizo" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "padre" TEXT,
    "madre" TEXT,
    "padrino" TEXT,
    "madrina" TEXT,
    "libro" TEXT,
    "folio" TEXT,
    "observaciones" TEXT,
    "abuelaMaterna" TEXT,
    "abuelaPaterna" TEXT,
    "abueloMaterno" TEXT,
    "abueloPaterno" TEXT,
    "apellidos" TEXT,
    "celebrante" TEXT,
    "contenidoEspecial" TEXT,
    "doyFe" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "fechaSacramento" TIMESTAMP(3),
    "genero" TEXT,
    "lugarNacimiento" TEXT,
    "nombres" TEXT,
    "numero" TEXT,
    "tipoBautizado" TEXT,
    "tipoFormato" TEXT NOT NULL DEFAULT 'normal',
    "tipoHijo" TEXT,

    CONSTRAINT "Bautizo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comunion" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "genero" TEXT NOT NULL,
    "lugarNacimiento" TEXT,
    "fechaSacramento" TIMESTAMP(3) NOT NULL,
    "celebrante" TEXT,
    "padre" TEXT NOT NULL,
    "madre" TEXT NOT NULL,
    "bautizoParroquia" TEXT,
    "bautizoLibro" TEXT,
    "bautizoFolio" TEXT,
    "bautizoNumero" TEXT,
    "bautizoFecha" TIMESTAMP(3),
    "tipoPadrino" TEXT,
    "nombrePadrino" TEXT,
    "doyFePadrino" TEXT,
    "libro" TEXT,
    "folio" TEXT,
    "numero" TEXT,
    "tipoFormato" TEXT NOT NULL DEFAULT 'normal',
    "contenidoEspecial" TEXT,
    "observaciones" TEXT,

    CONSTRAINT "Comunion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Confirmacion" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apellidos" TEXT,
    "celebrante" TEXT,
    "contenidoEspecial" TEXT,
    "doyFe" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "fechaSacramento" TIMESTAMP(3),
    "genero" TEXT,
    "lugarNacimiento" TEXT,
    "nombres" TEXT,
    "numero" TEXT,
    "observaciones" TEXT,
    "tipoFormato" TEXT NOT NULL DEFAULT 'normal',
    "bautismoParroquia" TEXT,
    "bautismoLibro" TEXT,
    "bautismoFolio" TEXT,
    "bautismoNumero" TEXT,
    "bautismoFecha" TIMESTAMP(3),
    "tipoPadrino" TEXT,
    "nombrePadrino" TEXT,
    "apellidoPadrino" TEXT,
    "libro" TEXT,
    "folio" TEXT,

    CONSTRAINT "Confirmacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matrimonio" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contenidoEspecial" TEXT,
    "doyFe" TEXT,
    "observaciones" TEXT,
    "tipoFormato" TEXT NOT NULL DEFAULT 'normal',
    "nombreNovio" TEXT,
    "apellidoNovio" TEXT,
    "fechaNacimientoNovio" TIMESTAMP(3),
    "lugarNacimientoNovio" TEXT,
    "fechaBautismoNovio" TIMESTAMP(3),
    "lugarBautismoNovio" TEXT,
    "bautismoLibroNovio" TEXT,
    "bautismoFolioNovio" TEXT,
    "bautismoNumeroNovio" TEXT,
    "padreNovio" TEXT,
    "madreNovio" TEXT,
    "nombreNovia" TEXT,
    "apellidoNovia" TEXT,
    "fechaNacimientoNovia" TIMESTAMP(3),
    "lugarNacimientoNovia" TEXT,
    "fechaBautismoNovia" TIMESTAMP(3),
    "lugarBautismoNovia" TEXT,
    "bautismoLibroNovia" TEXT,
    "bautismoFolioNovia" TEXT,
    "bautismoNumeroNovia" TEXT,
    "padreNovia" TEXT,
    "madreNovia" TEXT,
    "fecha" TIMESTAMP(3),
    "celebrante" TEXT,
    "proclamas" TEXT,
    "testigo1Nombre" TEXT,
    "testigo1Apellido" TEXT,
    "testigo2Nombre" TEXT,
    "testigo2Apellido" TEXT,
    "testigo3Nombre" TEXT,
    "testigo3Apellido" TEXT,
    "testigo4Nombre" TEXT,
    "testigo4Apellido" TEXT,
    "libro" TEXT,
    "folio" TEXT,
    "numero" TEXT,

    CONSTRAINT "Matrimonio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Difunto" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contenidoEspecial" TEXT,
    "doyFe" TEXT,
    "observaciones" TEXT,
    "tipoFormato" TEXT NOT NULL DEFAULT 'normal',
    "nombre" TEXT,
    "apellidos" TEXT,
    "genero" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "lugarNacimiento" TEXT,
    "fechaFallecimiento" TIMESTAMP(3),
    "lugarFallecimiento" TEXT,
    "causaFallecimiento" TEXT,
    "nombreEsposa" TEXT,
    "nombrePadre" TEXT,
    "nombreMadre" TEXT,
    "bautismoFecha" TIMESTAMP(3),
    "bautismoLibro" TEXT,
    "bautismoFolio" TEXT,
    "bautismoNumero" TEXT,
    "libro" TEXT,
    "folio" TEXT,
    "numero" TEXT,

    CONSTRAINT "Difunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nivel" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nivel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grupo" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "horario" TEXT,
    "salon" TEXT,
    "capacidad" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nivelId" INTEGER,

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Catequista" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "fechaInicio" TIMESTAMP(3),
    "capacitaciones" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Catequista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatequistaGrupo" (
    "id" SERIAL NOT NULL,
    "catequistaId" INTEGER NOT NULL,
    "grupoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatequistaGrupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Catequesis" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "contenidoEspecial" TEXT,
    "fechaInicio" TIMESTAMP(3),
    "nombres" TEXT,
    "apellidos" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "lugarNacimiento" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "genero" TEXT,
    "email" TEXT,
    "bautizado" BOOLEAN NOT NULL DEFAULT false,
    "fechaBautismo" TIMESTAMP(3),
    "partidaBautismoUrl" TEXT,
    "primeraComunion" BOOLEAN NOT NULL DEFAULT false,
    "fechaPrimeraComunion" TIMESTAMP(3),
    "confirmacion" BOOLEAN NOT NULL DEFAULT false,
    "fechaConfirmacion" TIMESTAMP(3),
    "nombrePadre" TEXT,
    "telefonoPadre" TEXT,
    "nombreMadre" TEXT,
    "telefonoMadre" TEXT,
    "nombreAcudiente" TEXT,
    "telefonoAcudiente" TEXT,
    "etapa" TEXT,
    "nivelId" INTEGER,
    "grupoId" INTEGER,
    "catequistaId" INTEGER,

    CONSTRAINT "Catequesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" SERIAL NOT NULL,
    "catequesisId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'presente',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donacion" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "concepto" TEXT,
    "tipo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventarioItem" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT,
    "ubicacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventarioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "lugar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cita" (
    "id" SERIAL NOT NULL,
    "parroqusiaId" INTEGER NOT NULL,
    "sacerdote" TEXT NOT NULL,
    "feligres" TEXT NOT NULL,
    "telefono" TEXT,
    "fechaHora" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Permiso_perfilId_modulo_key" ON "Permiso"("perfilId", "modulo");

-- CreateIndex
CREATE UNIQUE INDEX "Bautizo_parroqusiaId_libro_folio_numero_key" ON "Bautizo"("parroqusiaId", "libro", "folio", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "Comunion_parroqusiaId_libro_folio_numero_key" ON "Comunion"("parroqusiaId", "libro", "folio", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "Confirmacion_parroqusiaId_libro_folio_numero_key" ON "Confirmacion"("parroqusiaId", "libro", "folio", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "CatequistaGrupo_catequistaId_grupoId_key" ON "CatequistaGrupo"("catequistaId", "grupoId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perfil" ADD CONSTRAINT "Perfil_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permiso" ADD CONSTRAINT "Permiso_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bautizo" ADD CONSTRAINT "Bautizo_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comunion" ADD CONSTRAINT "Comunion_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Confirmacion" ADD CONSTRAINT "Confirmacion_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matrimonio" ADD CONSTRAINT "Matrimonio_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Difunto" ADD CONSTRAINT "Difunto_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nivel" ADD CONSTRAINT "Nivel_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Catequista" ADD CONSTRAINT "Catequista_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatequistaGrupo" ADD CONSTRAINT "CatequistaGrupo_catequistaId_fkey" FOREIGN KEY ("catequistaId") REFERENCES "Catequista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatequistaGrupo" ADD CONSTRAINT "CatequistaGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Catequesis" ADD CONSTRAINT "Catequesis_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Catequesis" ADD CONSTRAINT "Catequesis_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Catequesis" ADD CONSTRAINT "Catequesis_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Catequesis" ADD CONSTRAINT "Catequesis_catequistaId_fkey" FOREIGN KEY ("catequistaId") REFERENCES "Catequista"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_catequesisId_fkey" FOREIGN KEY ("catequesisId") REFERENCES "Catequesis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donacion" ADD CONSTRAINT "Donacion_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioItem" ADD CONSTRAINT "InventarioItem_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_parroqusiaId_fkey" FOREIGN KEY ("parroqusiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
