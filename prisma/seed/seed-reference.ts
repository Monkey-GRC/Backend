// Regulaciones (MD-75), capacidades automáticas ac_01…ac_06 (MD-83), marcos ofrecidos sin catálogo (D50) y el catálogo de conexiones
// (plataformas, canales, regiones, frecuencias y escenarios, D67) → base de datos.
//
//   npm run reference:load              # dry-run
//   npm run reference:load -- --apply   # escribe, en UNA transacción
//   npm run reference:verify            # solo lectura; sale con código 1 si algo no cuadra
//
// Mismas reglas que el seed de SOC 2: solo inserta lo que falta, aborta con diff si una fila existe con
// contenido distinto, no borra nada y se niega a correr como `monkey_app`.
import { connectAsOwner, short } from './db';
import {
  CAPABILITIES,
  CONNECTION_OPTIONS,
  CAPABILITIES_BY_SCENARIO,
  FRAMEWORK_OFFERS,
  FREQUENCIES_BY_CAPABILITY,
  INTEGRATIONS,
  PLATFORMS,
  PLATFORM_REGIONS,
  REGULATIONS,
} from './reference/data';

const apply = process.argv.includes('--apply');
const verify = process.argv.includes('--verify');
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

async function main() {
  const { prisma, target, currentUser } = await connectAsOwner();
  try {
    console.log(`Destino: ${target.user}@${target.host}:${target.port}/${target.database}  (${verify ? 'verify' : apply ? 'APPLY' : 'dry-run'})`);
    if (currentUser === 'monkey_app') {
      console.error('✗ Conectado como monkey_app: el seed usa el rol dueño (DATABASE_URL), no el de la app.');
      process.exit(1);
    }

    const regDb = await prisma.regulation.findMany();
    const capDb = await prisma.automatedCapability.findMany();
    const fwDb = await prisma.framework.findMany();

    const conflicts: string[] = [];
    const regMissing = REGULATIONS.filter((s) => {
      const d = regDb.find((r) => r.code === s.code);
      if (!d) return true;
      for (const f of ['name', 'jurisdiction'] as const) if (d[f] !== s[f]) conflicts.push(`regulación ${s.code}: ${f}  BD=${short(d[f])}  fuente=${short(s[f])}`);
      return false;
    });
    const capMissing = CAPABILITIES.filter((s) => {
      const d = capDb.find((r) => r.catalogCode === s.catalogCode);
      if (!d) return true;
      for (const f of ['category', 'method', 'provider', 'baseFrequency', 'generatedEvidence', 'assetType', 'requiredPermissions'] as const) {
        if (!same(d[f], s[f])) conflicts.push(`capacidad ${s.catalogCode}: ${f}  BD=${short(d[f])}  fuente=${short(s[f])}`);
      }
      return false;
    });
    // Los marcos de oferta (D50): solo se miran sus códigos. Si ya hay un marco con ese código (p. ej. porque
    // se cargó su catálogo completo) no se toca: manda su propio seed, no este.
    const fwMissing = FRAMEWORK_OFFERS.filter((s) => !fwDb.some((d) => d.code === s.code));
    // El catálogo de conexiones (D67). El orden de una plataforma es su posición dentro de su conexión en PLATFORMS.
    const platformKey = (cap: string, code: string) => `${cap}/${code}`;
    const platformsSource = PLATFORMS.map((p) => ({ ...p, sortOrder: PLATFORMS.filter((x) => x.capability === p.capability).indexOf(p) + 1 }));
    const platformDb = await prisma.capabilityPlatform.findMany({
      include: { automatedCapability: { select: { catalogCode: true } }, connectionMethods: true, regions: true },
    });
    const platformMissing = platformsSource.filter((s) => {
      const d = platformDb.find((r) => platformKey(r.automatedCapability.catalogCode, r.code) === platformKey(s.capability, s.code));
      if (!d) return true;
      for (const f of ['name', 'logoKey', 'availability', 'sortOrder'] as const) {
        if (d[f] !== s[f]) conflicts.push(`plataforma ${platformKey(s.capability, s.code)}: ${f}  BD=${short(d[f])}  fuente=${short(s[f])}`);
      }
      return false;
    });
    const methodsSource = platformsSource.flatMap((p) =>
      p.methods.map((m, i) => ({ platform: platformKey(p.capability, p.code), method: m, isRecommended: i === 0, sortOrder: i + 1 })),
    );
    const methodsDb = platformDb.flatMap((p) =>
      p.connectionMethods.map((m) => ({ platform: platformKey(p.automatedCapability.catalogCode, p.code), method: m.connectionMethod, isRecommended: m.isRecommended, sortOrder: m.sortOrder })),
    );
    const methodsMissing = methodsSource.filter((s) => {
      const d = methodsDb.find((r) => r.platform === s.platform && r.method === s.method);
      if (!d) return true;
      if (d.isRecommended !== s.isRecommended || d.sortOrder !== s.sortOrder) conflicts.push(`canal ${s.platform}/${s.method}: BD=${short(d)}  fuente=${short(s)}`);
      return false;
    });
    const regionsSource = Object.entries(PLATFORM_REGIONS).flatMap(([platform, list]) => list.map((r, i) => ({ platform, code: r.code, name: r.name, sortOrder: i + 1 })));
    const regionsDb = platformDb.flatMap((p) =>
      p.regions.map((r) => ({ platform: platformKey(p.automatedCapability.catalogCode, p.code), code: r.code, name: r.name, sortOrder: r.sortOrder })),
    );
    const regionsMissing = regionsSource.filter((s) => {
      const d = regionsDb.find((r) => r.platform === s.platform && r.code === s.code);
      if (!d) return true;
      if (d.name !== s.name || d.sortOrder !== s.sortOrder) conflicts.push(`región ${s.platform}/${s.code}: BD=${short(d)}  fuente=${short(s)}`);
      return false;
    });
    // Las opciones del asistente de conexión (D114). El orden es la posición dentro de su catálogo.
    const optionsSource = CONNECTION_OPTIONS.map((o) => ({ ...o, sortOrder: CONNECTION_OPTIONS.filter((x) => x.catalog === o.catalog).indexOf(o) + 1 }));
    const optionsDb = await prisma.connectionOption.findMany();
    const optionsMissing = optionsSource.filter((s) => {
      const d = optionsDb.find((r) => r.catalog === s.catalog && r.code === s.code);
      if (!d) return true;
      const db = { availability: d.availability, tags: d.tags, sortOrder: d.sortOrder };
      const src = { availability: s.availability, tags: s.tags, sortOrder: s.sortOrder };
      if (!same(db, src)) conflicts.push(`opción ${s.catalog}/${s.code}: BD=${short(db)}  fuente=${short(src)}`);
      return false;
    });
    // Las integraciones (D110): las de medición con flujo de conexión apuntan a su plataforma; el resto lleva su nombre, logo y disponibilidad.
    const integrationsSource = INTEGRATIONS.map((i, idx) => ({ ...i, sortOrder: idx + 1 }));
    const integrationsDb = await prisma.integration.findMany({ include: { capabilityPlatform: { include: { automatedCapability: { select: { catalogCode: true } } } } } });
    const integrationsMissing = integrationsSource.filter((s) => {
      const d = integrationsDb.find((r) => r.code === s.code);
      if (!d) return true;
      const dbPlatform = d.capabilityPlatform ? platformKey(d.capabilityPlatform.automatedCapability.catalogCode, d.capabilityPlatform.code) : null;
      const db = { purpose: d.purpose, platform: dbPlatform, name: d.name, logoKey: d.logoKey, availability: d.availability, sortOrder: d.sortOrder };
      const src = { purpose: s.purpose, platform: s.platform, name: s.name, logoKey: s.logoKey, availability: s.availability, sortOrder: s.sortOrder };
      if (!same(db, src)) conflicts.push(`integración ${s.code}: BD=${short(db)}  fuente=${short(src)}`);
      return false;
    });
    const freqDb = (await prisma.capabilityFrequency.findMany({ include: { automatedCapability: { select: { catalogCode: true } } } })).map((f) => `${f.automatedCapability.catalogCode}/${f.scheduleFrequency}`);
    const freqSource = Object.entries(FREQUENCIES_BY_CAPABILITY).flatMap(([cap, list]) => list.map((f) => `${cap}/${f}`));
    const freqMissing = freqSource.filter((k) => !freqDb.includes(k));
    const scenDb = (await prisma.deploymentScenarioCapability.findMany({ include: { automatedCapability: { select: { catalogCode: true } } } })).map((f) => `${f.deploymentScenario}/${f.automatedCapability.catalogCode}`);
    const scenSource = Object.entries(CAPABILITIES_BY_SCENARIO).flatMap(([sc, list]) => list.map((c) => `${sc}/${c}`));
    const scenMissing = scenSource.filter((k) => !scenDb.includes(k));

    const orphans = [
      ...regDb.filter((d) => !REGULATIONS.some((s) => s.code === d.code)).map((d) => `regulación ${d.code} está en la base y no en la fuente`),
      ...capDb.filter((d) => !CAPABILITIES.some((s) => s.catalogCode === d.catalogCode)).map((d) => `capacidad ${d.catalogCode} está en la base y no en la fuente`),
      ...platformDb.filter((d) => !platformsSource.some((s) => platformKey(s.capability, s.code) === platformKey(d.automatedCapability.catalogCode, d.code))).map((d) => `plataforma ${platformKey(d.automatedCapability.catalogCode, d.code)} está en la base y no en la fuente`),
      ...methodsDb.filter((d) => !methodsSource.some((s) => s.platform === d.platform && s.method === d.method)).map((d) => `canal ${d.platform}/${d.method} está en la base y no en la fuente`),
      ...regionsDb.filter((d) => !regionsSource.some((s) => s.platform === d.platform && s.code === d.code)).map((d) => `región ${d.platform}/${d.code} está en la base y no en la fuente`),
      ...integrationsDb.filter((d) => !integrationsSource.some((s) => s.code === d.code)).map((d) => `integración ${d.code} está en la base y no en la fuente`),
      ...optionsDb.filter((d) => !optionsSource.some((s) => s.catalog === d.catalog && s.code === d.code)).map((d) => `opción ${d.catalog}/${d.code} está en la base y no en la fuente`),
      ...freqDb.filter((k) => !freqSource.includes(k)).map((k) => `frecuencia ${k} está en la base y no en la fuente`),
      ...scenDb.filter((k) => !scenSource.includes(k)).map((k) => `escenario ${k} está en la base y no en la fuente`),
    ];

    console.log('\ntabla                    fuente   a insertar');
    console.log(`regulations              ${String(REGULATIONS.length).padStart(6)}   ${String(regMissing.length).padStart(10)}`);
    console.log(`automated_capabilities   ${String(CAPABILITIES.length).padStart(6)}   ${String(capMissing.length).padStart(10)}`);
    console.log(`frameworks (ofrecidos)   ${String(FRAMEWORK_OFFERS.length).padStart(6)}   ${String(fwMissing.length).padStart(10)}`);
    console.log(`capability_platforms     ${String(platformsSource.length).padStart(6)}   ${String(platformMissing.length).padStart(10)}`);
    console.log(`platform_connection_methods ${String(methodsSource.length).padStart(3)}   ${String(methodsMissing.length).padStart(10)}`);
    console.log(`platform_regions         ${String(regionsSource.length).padStart(6)}   ${String(regionsMissing.length).padStart(10)}`);
    console.log(`connection_options       ${String(optionsSource.length).padStart(6)}   ${String(optionsMissing.length).padStart(10)}`);
    console.log(`integrations             ${String(integrationsSource.length).padStart(6)}   ${String(integrationsMissing.length).padStart(10)}`);
    console.log(`capability_frequencies   ${String(freqSource.length).padStart(6)}   ${String(freqMissing.length).padStart(10)}`);
    console.log(`deployment_scenario_capabilities ${String(scenSource.length).padStart(0)}  ${String(scenMissing.length).padStart(10)}`);
    orphans.forEach((m) => console.warn('  ⚠ ' + m + ' (NO se toca)'));
    if (conflicts.length) {
      console.error(`\n✗ ${conflicts.length} fila(s) existen con contenido DISTINTO al de la fuente. No se sobrescribe nada:`);
      conflicts.forEach((m) => console.error('  - ' + m));
      process.exit(1);
    }

    if (verify) {
      const problems = [
        ...regMissing.map((s) => `falta la regulación ${s.code}`),
        ...capMissing.map((s) => `falta la capacidad ${s.catalogCode}`),
        ...fwMissing.map((s) => `falta el marco ofrecido ${s.code}`),
        ...platformMissing.map((s) => `falta la plataforma ${platformKey(s.capability, s.code)}`),
        ...methodsMissing.map((s) => `falta el canal ${s.platform}/${s.method}`),
        ...regionsMissing.map((s) => `falta la región ${s.platform}/${s.code}`),
        ...optionsMissing.map((s) => `falta la opción ${s.catalog}/${s.code}`),
        ...integrationsMissing.map((s) => `falta la integración ${s.code}`),
        ...freqMissing.map((k) => `falta la frecuencia ${k}`),
        ...scenMissing.map((k) => `falta la fila de escenario ${k}`),
        ...orphans,
      ];
      if (problems.length) {
        problems.forEach((m) => console.error('  ✗ ' + m));
        process.exit(1);
      }
      console.log(`\n  ✓ regulations = ${REGULATIONS.length}, idénticas a la fuente\n  ✓ automated_capabilities = ${CAPABILITIES.length}, idénticas a la fuente\n  ✓ frameworks ofrecidos = ${FRAMEWORK_OFFERS.length}, presentes\n  ✓ catálogo de conexiones: ${platformsSource.length} plataformas, ${methodsSource.length} canales, ${regionsSource.length} regiones, ${freqSource.length} frecuencias, ${scenSource.length} filas de escenario, ${integrationsSource.length} integraciones, ${optionsSource.length} opciones de conexión`);
      console.log('\n✓ Los catálogos de referencia coinciden con la fuente.');
      return;
    }

    const total = regMissing.length + capMissing.length + fwMissing.length + platformMissing.length + methodsMissing.length + regionsMissing.length + integrationsMissing.length + optionsMissing.length + freqMissing.length + scenMissing.length;
    if (total === 0) {
      console.log('\n✓ La base ya coincide con la fuente. Nada que insertar.');
      return;
    }
    if (!apply) {
      console.log(`\nDry-run: se insertarían ${total} filas. Nada se escribió. Repite con -- --apply para cargarlas.`);
      return;
    }
    await prisma.$transaction(async (tx) => {
      await tx.regulation.createMany({ data: regMissing.map((r) => ({ ...r })) });
      await tx.automatedCapability.createMany({ data: capMissing.map((c) => ({ ...c })) });
      // Sin requisitos ni controles: son oferta comercial, no se pueden contratar (availability = coming_soon).
      await tx.framework.createMany({ data: fwMissing.map((f) => ({ ...f, availability: 'coming_soon' as const })) });
      // El catálogo de conexiones (D67), con los ids de las capacidades y plataformas ya sembradas.
      const caps = new Map((await tx.automatedCapability.findMany({ select: { id: true, catalogCode: true } })).map((c) => [c.catalogCode, c.id]));
      const capId = (code: string) => caps.get(code) ?? (() => { throw new Error(`Falta la capacidad ${code}`); })();
      await tx.capabilityPlatform.createMany({
        data: platformMissing.map((p) => ({ automatedCapabilityId: capId(p.capability), code: p.code, name: p.name, logoKey: p.logoKey, availability: p.availability, sortOrder: p.sortOrder })),
      });
      const plats = new Map((await tx.capabilityPlatform.findMany({ include: { automatedCapability: { select: { catalogCode: true } } } })).map((p) => [platformKey(p.automatedCapability.catalogCode, p.code), p.id]));
      const platId = (key: string) => plats.get(key) ?? (() => { throw new Error(`Falta la plataforma ${key}`); })();
      await tx.platformConnectionMethod.createMany({
        data: methodsMissing.map((m) => ({ platformId: platId(m.platform), connectionMethod: m.method, isRecommended: m.isRecommended, sortOrder: m.sortOrder })),
      });
      await tx.platformRegion.createMany({ data: regionsMissing.map((r) => ({ platformId: platId(r.platform), code: r.code, name: r.name, sortOrder: r.sortOrder })) });
      await tx.integration.createMany({
        data: integrationsMissing.map((i) => ({ code: i.code, purpose: i.purpose, capabilityPlatformId: i.platform ? platId(i.platform) : null, name: i.name, logoKey: i.logoKey, availability: i.availability, sortOrder: i.sortOrder })),
      });
      await tx.connectionOption.createMany({ data: optionsMissing.map((o) => ({ catalog: o.catalog, code: o.code, availability: o.availability, tags: o.tags, sortOrder: o.sortOrder })) });
      await tx.capabilityFrequency.createMany({
        data: freqMissing.map((k) => ({ automatedCapabilityId: capId(k.split('/')[0]), scheduleFrequency: k.split('/')[1] as 'continuous' })),
      });
      await tx.deploymentScenarioCapability.createMany({
        data: scenMissing.map((k) => ({ deploymentScenario: k.split('/')[0] as 'hybrid', automatedCapabilityId: capId(k.split('/')[1]) })),
      });
      // Las conexiones que ya existían apuntan a su plataforma (`platform` = código, p. ej. `aws`). Solo las que aún no la tienen.
      await tx.$executeRaw`UPDATE tenant.assets a SET platform_id = p.id FROM catalog.capability_platforms p JOIN catalog.automated_capabilities c ON c.id = p.automated_capability_id WHERE a.platform_id IS NULL AND a.parent_asset_id IS NULL AND a.connection_category::text = c.catalog_code AND p.code = lower(a.platform)`;
    });
    console.log(`\n✓ Cargadas ${total} filas en una sola transacción. Ejecuta: npm run reference:verify`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
