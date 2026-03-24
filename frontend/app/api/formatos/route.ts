import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
import path from 'path';

function parsePlaceholders(contenido: string) {
  const campos: Record<string, string> = {};
  
  const placeholders = [
    'libro', 'folio', 'numero', 'parroquia', 'parroquiaconciudad', 'fecha',
    'ministro', 'tipobautizado', 'nombre', 'apellidos', 'lugar_nacimiento', 'fecha_nacimiento',
    'legitimo', 'padres', 'abuelos_paternos', 'abuelos_maternos', 'padrinos',
    'doyfe', 'marginal', 'quien_firma', 'ministro_firma', 'hoy',
    'bautizo_parroquia', 'bautizo_libro', 'bautizo_folio', 'bautizo_numero', 'bautizo_fecha',
    'tipo_padrino',
    'nombre_novio', 'apellido_novio', 'lugar_nacimiento_novio', 'fecha_nacimiento_novio',
    'padre_novio', 'madre_novio', 'lugar_bautismo_novio', 'fecha_bautismo_novio',
    'bautismo_libro_novio', 'bautismo_folio_novio', 'bautismo_numero_novio',
    'nombre_novia', 'apellido_novia', 'lugar_nacimiento_novia', 'fecha_nacimiento_novia',
    'padre_novia', 'madre_novia', 'lugar_bautismo_novia', 'fecha_bautismo_novia',
    'bautismo_libro_novia', 'bautismo_folio_novia', 'bautismo_numero_novia',
    'testigos', 'proclamas',
    'nombre', 'apellidos', 'genero', 'lugar_nacimiento', 'fecha_nacimiento',
    'lugar_fallecimiento', 'fecha_fallecimiento', 'causa_fallecimiento',
    'nombre_esposa', 'nombre_padre', 'nombre_madre',
    'bautismo_fecha', 'bautismo_libro', 'bautismo_folio', 'bautismo_numero',
    'nombre_catequizando', 'nivel', 'grupo', 'fecha_inicio',
    'nombre_catequista', 'telefono_padre', 'telefono_madre',
    'bautizado', 'primera_comunion', 'confirmacion',
    'fecha_bautismo', 'fecha_primera_comunion', 'fecha_confirmacion'
  ];

  for (const placeholder of placeholders) {
    const regex = new RegExp(`<${placeholder}>`, 'gi');
    if (regex.test(contenido)) {
      campos[placeholder] = '';
    }
  }

  return campos;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo') || 'normal';
  const modulo = searchParams.get('modulo') || 'bautizos';

  const fileMap: Record<string, string> = {
    'bautizos-normal': 'baunormal.docx',
    'bautizos-especial': 'formato_bautizo.md',
    'comuniones-normal': 'comnormal.docx',
    'comuniones-especial': 'formato_comunion.md',
    'confirmaciones-normal': 'connormal.docx',
    'confirmaciones-especial': 'formato_confirmacion.md',
    'matrimonios-normal': 'matnormal.docx',
    'matrimonios-especial': 'formato_matrimonio.md',
    'difuntos-normal': 'defnormal.docx',
    'difuntos-especial': 'formato_difuncion.md',
    'catequesis-especial': 'formato_catequesis.md',
  };

  const key = `${modulo}-${tipo}`;
  const filename = fileMap[key];

  if (!filename) {
    return NextResponse.json({ error: 'Formato no encontrado' }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), 'lib', 'docs', 'formatos', filename);
    let contenido: string;
    
    if (filename.endsWith('.md')) {
      const fs = require('fs');
      contenido = fs.readFileSync(filePath, 'utf-8');
    } else {
      const result = await mammoth.extractRawText({ path: filePath });
      contenido = result.value;
    }
    
    const campos = parsePlaceholders(contenido);
    
    return NextResponse.json({ contenido, campos, tipo });
  } catch (error) {
    return NextResponse.json({ error: 'Error al leer el archivo' }, { status: 500 });
  }
}
