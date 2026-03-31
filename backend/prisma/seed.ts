import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const modulos = [
  'usuarios', 'perfiles', 'parroquias', 'bautizos', 'confirmaciones',
  'matrimonios', 'difuntos', 'catequesis', 'donaciones', 'inventario', 'permisos',
  'eventos', 'reportes', 'citas', 'grupos', 'catequistas'
];

async function main() {
  // Crear o encontrar parroquia
  let parroqusia = await prisma.parroquia.findFirst();
  if (!parroqusia) {
    parroqusia = await prisma.parroquia.create({
      data: {
        nombre: 'Parroquia Principal',
        ciudad: 'Ciudad Principal',
        direccion: 'Dirección Principal',
        telefono: '0000000000',
      },
    });
    console.log('Parroquia creada:', parroqusia.nombre);
  } else {
    console.log('Parroquia encontrada:', parroqusia.nombre);
  }

  // Crear o encontrar perfil super admin
  let superAdminPerfil = await prisma.perfil.findFirst({
    where: { nombre: 'Super Admin' }
  });

  if (!superAdminPerfil) {
    superAdminPerfil = await prisma.perfil.create({
      data: {
        nombre: 'Super Admin',
        descripcion: 'Perfil con acceso total al sistema',
        parroqusiaId: parroqusia.id,
      },
    });
    console.log('Perfil creado:', superAdminPerfil.nombre);
  } else {
    console.log('Perfil encontrado:', superAdminPerfil.nombre);
  }

  // Eliminar permisos existentes y crear nuevos
  await prisma.permiso.deleteMany({
    where: { perfilId: superAdminPerfil.id }
  });

  await prisma.permiso.createMany({
    data: modulos.flatMap((modulo) => ({
      perfilId: superAdminPerfil!.id,
      modulo,
      ver: true,
      crear: true,
      editar: true,
      eliminar: true,
    })),
  });
  console.log('Permisos actualizados');

  // Crear o actualizar usuario admin
  const hashedPassword = await bcrypt.hash('123456', 10);
  let usuario = await prisma.usuario.findUnique({
    where: { email: 'admin@parroquia.com' }
  });

  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        nombre: 'Administrador',
        email: 'admin@parroquia.com',
        password: hashedPassword,
        parroqusiaId: parroqusia.id,
        perfilId: superAdminPerfil.id,
        activo: true,
      },
    });
    console.log('Usuario creado:', usuario.email);
  } else {
    // Actualizar el perfilId del usuario existente
    usuario = await prisma.usuario.update({
      where: { email: 'admin@parroquia.com' },
      data: {
        perfilId: superAdminPerfil.id,
        parroqusiaId: parroqusia.id,
        password: hashedPassword,
      },
    });
    console.log('Usuario actualizado:', usuario.email);
  }
  console.log('Contraseña: 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
