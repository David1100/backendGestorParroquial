import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ParroquiasModule } from './parroquias/parroquias.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PerfilesModule } from './perfiles/perfiles.module';
import { PermisosModule } from './permisos/permisos.module';
import { BautizosModule } from './bautizos/bautizos.module';
import { ComunionesModule } from './comuniones/comuniones.module';
import { ConfirmacionesModule } from './confirmaciones/confirmaciones.module';
import { MatrimoniosModule } from './matrimonios/matrimonios.module';
import { DifuntosModule } from './difuntos/difuntos.module';
import { CatequesisModule } from './catequesis/catequesis.module';
import { DonacionesModule } from './donaciones/donaciones.module';
import { InventarioModule } from './inventario/inventario.module';
import { EventosModule } from './eventos/eventos.module';
import { ReportesModule } from './reportes/reportes.module';
import { CitasModule } from './citas/citas.module';
import { PartidasModule } from './partidas/partidas.module';
import { QuienfirmaModule } from './quienfirma/quienfirma.module';
import { GrupoModule } from './grupos/grupo.module';
import { CatequistaModule } from './catequistas/catequista.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ParroquiasModule,
    UsuariosModule,
    PerfilesModule,
    PermisosModule,
    BautizosModule,
    ComunionesModule,
    ConfirmacionesModule,
    MatrimoniosModule,
    DifuntosModule,
    CatequesisModule,
    DonacionesModule,
    InventarioModule,
    EventosModule,
    ReportesModule,
    CitasModule,
    PartidasModule,
    QuienfirmaModule,
    GrupoModule,
    CatequistaModule,
  ],
})
export class AppModule {}
