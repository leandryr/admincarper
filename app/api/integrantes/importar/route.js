import { NextResponse } from 'next/server';
import db from '@/lib/mongodb';
import Integrante from '@/models/Integrante';

export async function POST(req) {
  try {
    await db();
    const body = await req.json();
    const integrantes = body.integrantes || [];

    if (!Array.isArray(integrantes) || integrantes.length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron integrantes' }, { status: 400 });
    }

    const nuevos = [];

    // Buscar el último código registrado en BD para seguir el correlativo
    const ultimo = await Integrante.findOne({ codigo: /^CC\d{5}$/ }).sort({ codigo: -1 });

    let ultimoNumero = 0;
    if (ultimo?.codigo) {
      ultimoNumero = parseInt(ultimo.codigo.replace('CC', '')) || 0;
    }

    for (const item of integrantes) {
      const existe = await Integrante.findOne({
        tipoDoc: item.tipoDoc,
        docNumero: item.docNumero
      });

      if (!existe) {
        ultimoNumero += 1;
        const nuevoCodigo = `CC${String(ultimoNumero).padStart(5, '0')}`;
        const nombres = [item.primerNombre, item.segundoNombre].filter(Boolean).join(' ').trim();

        const nuevo = new Integrante({
          codigo: nuevoCodigo,
          tipoDoc: item.tipoDoc,
          docNumero: item.docNumero,
          primerNombre: item.primerNombre || '',
          segundoNombre: item.segundoNombre || '',
          nombres,
          apPaterno: item.apPaterno || '',
          apMaterno: item.apMaterno || '',
          sexo: item.sexo || '',
          telefono: item.telefono || '',
          email: item.email || '',
          numeroSocio: item.numeroSocio || '',
          fechaNacimiento: {
            dia: item.fechaNacimiento?.dia || '',
            mes: item.fechaNacimiento?.mes || '',
            anio: item.fechaNacimiento?.anio || '1900'
          },
          status: item.status || 'ACTIVO',
          cargo: item.cargo || '',
          participacion: item.participacion || 'NO',
          foto: item.foto || '',
          representantes: item.representantes || []
        });

        await nuevo.save();
        nuevos.push(nuevo);
      }
    }

    return NextResponse.json({
      mensaje: `${nuevos.length} integrantes importados correctamente`,
      registros: nuevos
    });
  } catch (error) {
    console.error('Error al importar integrantes:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
