/* =====================================================================
   CATÁLOGOS BASE PARA ESTANDARIZAR LA REDACCIÓN
   ---------------------------------------------------------------------
   - Edita estas listas para ajustarlas a tu zona o a la nomenclatura
     oficial vigente. Son una base inicial y deben ser revisadas.
   - Los campos siguen aceptando texto libre: estas listas solo se
     ofrecen como sugerencias al escribir.
   - Además de estas listas, la app sugiere automáticamente los valores
     que cada usuario ya ha utilizado en sus mensajes anteriores.
   ===================================================================== */
window.CATALOGOS = {
  // Grados para el perfil del usuario (remitente)
  grados: [
    'Carabinero', 'Cabo 2°', 'Cabo 1°', 'Sargento 2°', 'Sargento 1°', 'Suboficial',
    'Suboficial Mayor', 'Subteniente', 'Teniente', 'Capitán', 'Mayor', 'Teniente Coronel', 'Coronel'
  ],

  // Sugerencias para el campo "Título / Delito"
  tiposProcedimiento: [
    'ROBO CON VIOLENCIA',
    'ROBO CON INTIMIDACIÓN',
    'ROBO POR SORPRESA',
    'ROBO EN LUGAR HABITADO',
    'ROBO EN LUGAR NO HABITADO',
    'ROBO EN BIENES NACIONALES DE USO PÚBLICO',
    'ROBO DE VEHÍCULO MOTORIZADO',
    'ROBO DE ACCESORIOS DE VEHÍCULO',
    'HURTO SIMPLE',
    'HURTO FALTA',
    'RECEPTACIÓN',
    'RECEPTACIÓN DE VEHÍCULO MOTORIZADO',
    'LESIONES',
    'HOMICIDIO',
    'FEMICIDIO',
    'VIOLENCIA INTRAFAMILIAR',
    'AMENAZAS',
    'ABUSO SEXUAL',
    'VIOLACIÓN',
    'SECUESTRO',
    'INFRACCIÓN LEY 20.000 (DROGAS)',
    'TENENCIA ILEGAL DE ARMA DE FUEGO',
    'PORTE ILEGAL DE ARMA DE FUEGO',
    'DISPAROS INJUSTIFICADOS',
    'PORTE DE ARMA BLANCA',
    'CONDUCCIÓN EN ESTADO DE EBRIEDAD',
    'CONDUCCIÓN BAJO LA INFLUENCIA DEL ALCOHOL',
    'ACCIDENTE DE TRÁNSITO CON LESIONADOS',
    'ACCIDENTE DE TRÁNSITO CON RESULTADO DE MUERTE',
    'DAÑOS',
    'INCENDIO',
    'USURPACIÓN',
    'DESÓRDENES PÚBLICOS',
    'MALTRATO DE OBRA A CARABINEROS',
    'ORDEN DE DETENCIÓN VIGENTE',
    'QUEBRANTAMIENTO DE CONDENA',
    'DESACATO',
    'PRESUNTA DESGRACIA',
    'HALLAZGO DE CADÁVER',
    'INGRESO CLANDESTINO AL PAÍS'
  ],

  // Se escriben sin la palabra "Prefectura"; la app la agrega y abrevia "Santiago" como "Stgo."
  prefecturas: [
    'Santiago Central',
    'Santiago Norte',
    'Santiago Sur',
    'Santiago Oriente',
    'Santiago Occidente',
    'Santiago Rinconada',
    'Santiago Cordillera'
  ],

  // Agrega aquí las unidades de tu prefectura, por ejemplo: '13 Com. La Granja'
  unidades: [],

  // Comunas de la Región Metropolitana
  comunas: [
    'Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina', 'Conchalí',
    'Curacaví', 'El Bosque', 'El Monte', 'Estación Central', 'Huechuraba', 'Independencia',
    'Isla de Maipo', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina',
    'Lampa', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú',
    'María Pinto', 'Melipilla', 'Ñuñoa', 'Padre Hurtado', 'Paine', 'Pedro Aguirre Cerda',
    'Peñaflor', 'Peñalolén', 'Pirque', 'Providencia', 'Pudahuel', 'Puente Alto', 'Quilicura',
    'Quinta Normal', 'Recoleta', 'Renca', 'San Bernardo', 'San Joaquín', 'San José de Maipo',
    'San Miguel', 'San Pedro', 'San Ramón', 'Santiago', 'Talagante', 'Tiltil', 'Vitacura'
  ],

  nacionalidades: [
    'Chileno(a)', 'Venezolano(a)', 'Colombiano(a)', 'Peruano(a)', 'Boliviano(a)',
    'Haitiano(a)', 'Argentino(a)', 'Ecuatoriano(a)', 'Dominicano(a)', 'Paraguayo(a)',
    'Cubano(a)', 'Uruguayo(a)', 'Brasileño(a)', 'Chino(a)', 'Estadounidense', 'Español(a)'
  ],

  tiposEspecie: [
    'Arma de fuego',
    'Arma a fogueo / réplica',
    'Munición',
    'Arma blanca',
    'Droga',
    'Dinero en efectivo',
    'Vehículo',
    'Teléfono celular',
    'Especies electrónicas',
    'Herramientas',
    'Vestimenta',
    'Documentos',
    'Especies varias'
  ],

  condicionesEspecie: ['Incautada', 'Recuperada']
};
