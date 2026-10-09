/* Seed content for update v10: two guide articles (4 languages). Loaded by the dashboard migration. */
(function (root) {
  'use strict';
  var IMG1 = 'assets/img/sidi-kankouch-1-muk6zfyn.webp', IMG2 = 'assets/img/20073-mujr4ueq.webp', IMG3 = 'assets/img/oued-alian-muk6t40e.webp';

  function pick(n, img, alt, title, tag, chips, text, link, linkTxt) {
    return '<div class="pick"><img src="' + img + '" alt="' + alt + '" loading="lazy"><div><h3>' + n + '. ' + title + '</h3><p><b>' + tag + '</b></p>' +
      '<ul class="chips-row">' + chips.map(function (c) { return '<li><span class="chip-' + c[0] + '">' + c[1] + '</span></li>'; }).join('') + '</ul>' +
      '<p>' + text + '</p><p><a href="~/tourisme/' + link + '/">' + linkTxt + '</a></p></div></div>';
  }

  var beaches = {
    slug: 'meilleures-plages-familles', section: 'guide', category: 'beach', cover: IMG1, gallery: [], map: '', lat: null, lng: null,
    date: '2026-10-09', updated: '2026-10-09', draft: false, featured: false, related: ['bateaux-tanger-med'], video: '', wx: 'off',
    i18n: {
      ar: {
        title: 'أفضل 3 شواطئ للعائلات في القصر الصغير',
        seoTitle: 'أفضل شواطئ القصر الصغير للعائلات والأطفال | دليل 2026',
        description: 'أفضل 3 شواطئ للعائلات في القصر الصغير: سيدي قنقوش 1، شاطئ المدينة وواد اليان. مقارنة الحراسة والمرافق والزحام مع نصائح للأطفال.',
        keyword: 'شواطئ القصر الصغير للعائلات',
        alt: 'شاطئ سيدي قنقوش 1 قرب القصر الصغير، من أفضل الشواطئ للعائلات',
        content:
          '<div class="quick"><b>⚡ الجواب السريع</b><ol><li><b>سيدي قنقوش 1</b>: الأكمل من حيث الخدمات (دشات، مطاعم، حراسة في الموسم).</li><li><b>شاطئ القصر الصغير</b>: في قلب المدينة، سهل الوصول وقريب من كل شيء.</li><li><b>واد اليان</b>: واسع جداً، فيه مساحة للأطفال حتى في الذروة.</li></ol></div>' +
          '<p>اخترنا هذه الشواطئ على أساس ما يهم العائلات أولاً: الأمان والحراسة، المرافق، سهولة الوصول، والمساحة للأطفال. المعلومات مبنية على مواضيع دليل القصر الصغير وعلى تجربة ابن المنطقة.</p>' +
          '<h2>الشواطئ الثلاثة</h2>' +
          pick(1, IMG1, 'شاطئ سيدي قنقوش 1', 'شاطئ سيدي قنقوش 1', '⭐ الأنسب للعائلات التي تريد كل شيء في مكان واحد',
            [['ok', '🛡️ حراسة في يوليو وغشت'], ['ok', '🚿 دشات ومراحيض'], ['ok', '🍽️ مطاعم موسمية'], ['ok', '🅿️ موقف سيارات'], ['mid', '👥 زحام في الذروة']],
            'من أكثر شواطئ المنطقة اكتمالاً من حيث الخدمات، على الطريق الساحلية غرب القصر الصغير، في اتجاه طنجة. يمكنك قضاء يوم كامل دون أن تحمل الأكل أو تقلق بشأن الدوش.', 'sidi-kankouch-1', 'كل شيء عن سيدي قنقوش 1 ←') +
          pick(2, IMG2, 'شاطئ القصر الصغير على مضيق جبل طارق', 'شاطئ القصر الصغير', '🏙️ الأقرب والأسهل',
            [['ok', '🛡️ محروس في الصيف'], ['ok', '💰 مجاني'], ['ok', '🚶 في قلب المدينة'], ['mid', '👥 زحام في غشت']],
            'الشاطئ الرئيسي للمدينة، برمال ذهبية وإطلالة مباشرة على المضيق والساحل الإسباني في الأيام الصافية. قريب من المقاهي والمحلات، فلا تحتاج للتنقل بعيداً مع الأطفال.', 'plage', 'كل شيء عن شاطئ القصر الصغير ←') +
          pick(3, IMG3, 'شاطئ واد اليان الواسع', 'شاطئ واد اليان', '🏖️ لمن يبحث عن المساحة',
            [['mid', '🛡️ حراسة متقطعة في الصيف'], ['ok', '📏 واسع جداً'], ['no', '🍽️ بلا مطاعم ولا دشات']],
            'امتداد رملي طويل يستوعب أعداداً كبيرة حتى في الذروة، بمياه معتدلة ورمال ناعمة مناسبة للأطفال الصغار. لا توجد خدمات، فاحمل معك الأكل والماء.', 'oued-alian', 'كل شيء عن واد اليان ←') +
          '<h2>مقارنة سريعة</h2><table><thead><tr><th>الشاطئ</th><th>الحراسة</th><th>المرافق</th><th>المطاعم</th><th>الزحام</th></tr></thead><tbody>' +
          '<tr><td><b>سيدي قنقوش 1</b></td><td>✅ طوال الموسم</td><td>✅</td><td>✅ موسمية</td><td>🟠 مرتفع</td></tr>' +
          '<tr><td><b>شاطئ القصر الصغير</b></td><td>✅ في الصيف</td><td>🟡 خدمات المدينة</td><td>✅ قريبة</td><td>🟠 في غشت</td></tr>' +
          '<tr><td><b>واد اليان</b></td><td>🟡 متقطعة</td><td>❌</td><td>❌</td><td>🟢 أقل</td></tr></tbody></table>' +
          '<div class="warn">⚠️ <b>تنبيه:</b> الحراسة والخدمات موسمية (غالباً يوليوز وغشت) وتختلف من سنة لأخرى. احترم دائماً الرايات وتعليمات المنقذين، وتجنب السباحة في أيام الشرقي القوي. اطلع على <a href="~/mer/">حالة البحر اليوم</a> قبل الخروج.</div>' +
          '<h2>نصائح للعائلات</h2><ul><li>اذهب في الصباح الباكر في غشت: الموقف أسهل والشمس أخف على الأطفال.</li><li>احمل مظلة وماء كافياً، خاصة في الشواطئ بدون خدمات.</li><li>الرياح الشرقية (الشرقي) ترفع الموج على الشاطئ؛ أيام الغربي غالباً أهدأ للسباحة.</li><li>اتفق مع الأطفال على نقطة لقاء واضحة قرب برج المراقبة.</li></ul>' +
          '<h2>شواطئ أخرى تستحق الزيارة</h2><ul><li><a href="~/tourisme/dalia/">شاطئ الدالية</a>: هادئ وأجواؤه عائلية.</li><li><a href="~/tourisme/zahara-hatba/">الزهارة / الحطبة</a>: أمواج هادئة غالباً.</li><li><a href="~/tourisme/sidi-kankouch-2/">سيدي قنقوش 2</a>: نفس الأجواء وأقل زحاماً.</li></ul>' +
          '<p>هل لاحظت معلومة لم تعد صحيحة؟ <a href="~/contact/">راسلنا</a> لنحدّث الدليل.</p>'
      },
      fr: {
        title: 'Les 3 meilleures plages pour les familles à Ksar Sghir',
        seoTitle: 'Meilleures plages de Ksar Sghir pour les familles | Guide 2026',
        description: 'Les 3 meilleures plages familiales de Ksar Sghir : Sidi Kankouch 1, la plage de la ville et Oued Alian. Surveillance, services, affluence et conseils.',
        keyword: 'plages Ksar Sghir familles',
        alt: 'Plage de Sidi Kankouch 1 près de Ksar Sghir, idéale pour les familles',
        content:
          '<div class="quick"><b>⚡ En bref</b><ol><li><b>Sidi Kankouch 1</b> : la plus complète (douches, restaurants, surveillance en saison).</li><li><b>Plage de Ksar Sghir</b> : en plein centre, facile d’accès et proche de tout.</li><li><b>Oued Alian</b> : très vaste, de la place pour les enfants même en haute saison.</li></ol></div>' +
          '<p>Nous avons retenu ces plages selon ce qui compte d’abord pour une famille : sécurité et surveillance, services, accès facile et espace pour les enfants. Les informations s’appuient sur les fiches du guide de Ksar Sghir et sur l’expérience d’un habitant de la région.</p>' +
          '<h2>Les trois plages</h2>' +
          pick(1, IMG1, 'Plage de Sidi Kankouch 1', 'Plage de Sidi Kankouch 1', '⭐ La meilleure pour avoir tout sur place',
            [['ok', '🛡️ Surveillée en juillet-août'], ['ok', '🚿 Douches et sanitaires'], ['ok', '🍽️ Restaurants saisonniers'], ['ok', '🅿️ Parking'], ['mid', '👥 Monde en haute saison']],
            'L’une des plages les mieux équipées de la région, sur la route côtière à l’ouest de Ksar Sghir, en direction de Tanger. On peut y passer la journée sans apporter à manger ni chercher une douche.', 'sidi-kankouch-1', 'Tout sur Sidi Kankouch 1 →') +
          pick(2, IMG2, 'Plage de Ksar Sghir face au détroit de Gibraltar', 'Plage de Ksar Sghir', '🏙️ La plus proche et la plus simple',
            [['ok', '🛡️ Surveillée l’été'], ['ok', '💰 Gratuite'], ['ok', '🚶 En centre-ville'], ['mid', '👥 Monde en août']],
            'La plage principale de la ville : sable doré et vue directe sur le détroit et la côte espagnole par temps clair. Cafés et commerces à deux pas, pas besoin de longs trajets avec les enfants.', 'plage', 'Tout sur la plage de Ksar Sghir →') +
          pick(3, IMG3, 'La vaste plage d’Oued Alian', 'Plage d’Oued Alian', '🏖️ Pour ceux qui veulent de l’espace',
            [['mid', '🛡️ Surveillance irrégulière'], ['ok', '📏 Très vaste'], ['no', '🍽️ Ni restaurants ni douches']],
            'Une longue bande de sable qui absorbe beaucoup de monde même en pleine saison, avec une mer modérée et un sable fin adapté aux tout-petits. Aucun service : prévoyez eau et repas.', 'oued-alian', 'Tout sur Oued Alian →') +
          '<h2>Comparatif rapide</h2><table><thead><tr><th>Plage</th><th>Surveillance</th><th>Services</th><th>Restaurants</th><th>Affluence</th></tr></thead><tbody>' +
          '<tr><td><b>Sidi Kankouch 1</b></td><td>✅ Toute la saison</td><td>✅</td><td>✅ Saisonniers</td><td>🟠 Forte</td></tr>' +
          '<tr><td><b>Plage de Ksar Sghir</b></td><td>✅ L’été</td><td>🟡 Ceux de la ville</td><td>✅ Proches</td><td>🟠 En août</td></tr>' +
          '<tr><td><b>Oued Alian</b></td><td>🟡 Irrégulière</td><td>❌</td><td>❌</td><td>🟢 Faible</td></tr></tbody></table>' +
          '<div class="warn">⚠️ <b>Attention :</b> surveillance et services sont saisonniers (souvent juillet-août) et changent d’une année à l’autre. Respectez toujours les drapeaux et les sauveteurs, et évitez la baignade par fort Levante. Consultez <a href="~/mer/">l’état de la mer aujourd’hui</a> avant de partir.</div>' +
          '<h2>Conseils pour les familles</h2><ul><li>En août, arrivez tôt : parking plus facile et soleil plus doux pour les enfants.</li><li>Prévoyez parasol et assez d’eau, surtout sur les plages sans services.</li><li>Le Levante (vent d’est) lève la houle sur la plage ; les jours de Poniente sont souvent plus calmes.</li><li>Fixez avec les enfants un point de rendez-vous clair près du poste de surveillance.</li></ul>' +
          '<h2>D’autres plages à voir</h2><ul><li><a href="~/tourisme/dalia/">Plage Dalia</a> : calme et familiale.</li><li><a href="~/tourisme/zahara-hatba/">Zahara / Hatba</a> : mer souvent calme.</li><li><a href="~/tourisme/sidi-kankouch-2/">Sidi Kankouch 2</a> : même ambiance, moins de monde.</li></ul>' +
          '<p>Une information n’est plus à jour ? <a href="~/contact/">Écrivez-nous</a> pour que nous corrigions le guide.</p>'
      },
      en: {
        title: 'The 3 best family beaches in Ksar Sghir',
        seoTitle: 'Best family beaches in Ksar Sghir, Morocco | 2026 guide',
        description: 'The 3 best family beaches in Ksar Sghir: Sidi Kankouch 1, the town beach and Oued Alian. Lifeguards, facilities, crowds and tips for kids.',
        keyword: 'Ksar Sghir family beaches',
        alt: 'Sidi Kankouch 1 beach near Ksar Sghir, one of the best beaches for families',
        content:
          '<div class="quick"><b>⚡ Quick answer</b><ol><li><b>Sidi Kankouch 1</b>: the best equipped (showers, restaurants, lifeguards in season).</li><li><b>Ksar Sghir beach</b>: right in town, easy to reach and close to everything.</li><li><b>Oued Alian</b>: very wide, with room for kids even at peak season.</li></ol></div>' +
          '<p>We picked these beaches on what matters most to families: safety and lifeguards, facilities, easy access and space for children. The information is based on the Ksar Sghir guide pages and on a local’s experience.</p>' +
          '<h2>The three beaches</h2>' +
          pick(1, IMG1, 'Sidi Kankouch 1 beach', 'Sidi Kankouch 1 beach', '⭐ Best if you want everything in one place',
            [['ok', '🛡️ Lifeguards in July–August'], ['ok', '🚿 Showers and toilets'], ['ok', '🍽️ Seasonal restaurants'], ['ok', '🅿️ Parking'], ['mid', '👥 Busy at peak times']],
            'One of the best-equipped beaches in the area, on the coast road west of Ksar Sghir, towards Tangier. You can spend the whole day without packing food or worrying about showers.', 'sidi-kankouch-1', 'All about Sidi Kankouch 1 →') +
          pick(2, IMG2, 'Ksar Sghir beach on the Strait of Gibraltar', 'Ksar Sghir beach', '🏙️ The closest and easiest',
            [['ok', '🛡️ Lifeguards in summer'], ['ok', '💰 Free'], ['ok', '🚶 In the town centre'], ['mid', '👥 Busy in August']],
            'The town’s main beach, with golden sand and a direct view of the Strait and the Spanish coast on clear days. Cafés and shops are nearby, so no long trips with the kids.', 'plage', 'All about Ksar Sghir beach →') +
          pick(3, IMG3, 'The wide beach of Oued Alian', 'Oued Alian beach', '🏖️ For those who want space',
            [['mid', '🛡️ Lifeguards on and off'], ['ok', '📏 Very wide'], ['no', '🍽️ No restaurants or showers']],
            'A long stretch of sand that takes big crowds even in high season, with moderate water and soft sand suited to young children. No facilities, so bring food and water.', 'oued-alian', 'All about Oued Alian →') +
          '<h2>Quick comparison</h2><table><thead><tr><th>Beach</th><th>Lifeguards</th><th>Facilities</th><th>Restaurants</th><th>Crowds</th></tr></thead><tbody>' +
          '<tr><td><b>Sidi Kankouch 1</b></td><td>✅ All season</td><td>✅</td><td>✅ Seasonal</td><td>🟠 High</td></tr>' +
          '<tr><td><b>Ksar Sghir beach</b></td><td>✅ Summer</td><td>🟡 Town services</td><td>✅ Nearby</td><td>🟠 In August</td></tr>' +
          '<tr><td><b>Oued Alian</b></td><td>🟡 On and off</td><td>❌</td><td>❌</td><td>🟢 Lower</td></tr></tbody></table>' +
          '<div class="warn">⚠️ <b>Note:</b> lifeguards and facilities are seasonal (usually July–August) and change from year to year. Always follow the flags and lifeguards, and avoid swimming on strong Levante days. Check <a href="~/mer/">today’s sea conditions</a> before you go.</div>' +
          '<h2>Tips for families</h2><ul><li>Arrive early in August: easier parking and gentler sun for the kids.</li><li>Bring shade and plenty of water, especially to beaches without facilities.</li><li>The easterly Levante builds waves on the beach; Poniente (westerly) days are usually calmer.</li><li>Agree on a clear meeting point with the kids near the lifeguard post.</li></ul>' +
          '<h2>Other beaches worth a visit</h2><ul><li><a href="~/tourisme/dalia/">Dalia beach</a>: calm, family atmosphere.</li><li><a href="~/tourisme/zahara-hatba/">Zahara / Hatba</a>: usually gentle waves.</li><li><a href="~/tourisme/sidi-kankouch-2/">Sidi Kankouch 2</a>: same feel, fewer people.</li></ul>' +
          '<p>Spotted something out of date? <a href="~/contact/">Message us</a> and we will update the guide.</p>'
      },
      es: {
        title: 'Las 3 mejores playas para familias en Alcazarseguer',
        seoTitle: 'Mejores playas para familias en Alcazarseguer | Guía 2026',
        description: 'Las 3 mejores playas familiares de Alcazarseguer (Ksar Sghir): Sidi Kankouch 1, la playa del pueblo y Oued Alian. Socorristas, servicios y consejos.',
        keyword: 'playas Alcazarseguer familias',
        alt: 'Playa de Sidi Kankouch 1 cerca de Alcazarseguer, ideal para familias',
        content:
          '<div class="quick"><b>⚡ Respuesta rápida</b><ol><li><b>Sidi Kankouch 1</b>: la más completa (duchas, restaurantes, socorristas en temporada).</li><li><b>Playa de Alcazarseguer</b>: en pleno pueblo, fácil acceso y cerca de todo.</li><li><b>Oued Alian</b>: muy amplia, con sitio para los niños incluso en temporada alta.</li></ol></div>' +
          '<p>Elegimos estas playas según lo que más importa a una familia: seguridad y socorristas, servicios, acceso fácil y espacio para los niños. La información se basa en las fichas de la guía de Alcazarseguer y en la experiencia de un vecino de la zona.</p>' +
          '<h2>Las tres playas</h2>' +
          pick(1, IMG1, 'Playa de Sidi Kankouch 1', 'Playa de Sidi Kankouch 1', '⭐ La mejor para tenerlo todo a mano',
            [['ok', '🛡️ Socorristas en julio y agosto'], ['ok', '🚿 Duchas y aseos'], ['ok', '🍽️ Restaurantes de temporada'], ['ok', '🅿️ Aparcamiento'], ['mid', '👥 Mucha gente en temporada alta']],
            'Una de las playas mejor equipadas de la zona, en la carretera de la costa al oeste de Alcazarseguer, hacia Tánger. Puedes pasar el día entero sin llevar comida ni buscar duchas.', 'sidi-kankouch-1', 'Todo sobre Sidi Kankouch 1 →') +
          pick(2, IMG2, 'Playa de Alcazarseguer frente al estrecho de Gibraltar', 'Playa de Alcazarseguer', '🏙️ La más cercana y sencilla',
            [['ok', '🛡️ Vigilada en verano'], ['ok', '💰 Gratis'], ['ok', '🚶 En el centro'], ['mid', '👥 Mucha gente en agosto']],
            'La playa principal del pueblo: arena dorada y vista directa al Estrecho y a la costa española en días claros. Cafés y tiendas al lado, sin largos trayectos con los niños.', 'plage', 'Todo sobre la playa de Alcazarseguer →') +
          pick(3, IMG3, 'La amplia playa de Oued Alian', 'Playa de Oued Alian', '🏖️ Para quien busca espacio',
            [['mid', '🛡️ Vigilancia irregular'], ['ok', '📏 Muy amplia'], ['no', '🍽️ Sin restaurantes ni duchas']],
            'Una larga franja de arena que acoge a mucha gente incluso en plena temporada, con mar moderado y arena fina apta para los más pequeños. Sin servicios: lleva comida y agua.', 'oued-alian', 'Todo sobre Oued Alian →') +
          '<h2>Comparativa rápida</h2><table><thead><tr><th>Playa</th><th>Socorristas</th><th>Servicios</th><th>Restaurantes</th><th>Afluencia</th></tr></thead><tbody>' +
          '<tr><td><b>Sidi Kankouch 1</b></td><td>✅ Toda la temporada</td><td>✅</td><td>✅ De temporada</td><td>🟠 Alta</td></tr>' +
          '<tr><td><b>Playa de Alcazarseguer</b></td><td>✅ En verano</td><td>🟡 Los del pueblo</td><td>✅ Cerca</td><td>🟠 En agosto</td></tr>' +
          '<tr><td><b>Oued Alian</b></td><td>🟡 Irregular</td><td>❌</td><td>❌</td><td>🟢 Menor</td></tr></tbody></table>' +
          '<div class="warn">⚠️ <b>Atención:</b> la vigilancia y los servicios son de temporada (normalmente julio y agosto) y cambian de un año a otro. Respeta siempre las banderas y a los socorristas, y evita bañarte con Levante fuerte. Mira <a href="~/mer/">el estado del mar hoy</a> antes de salir.</div>' +
          '<h2>Consejos para familias</h2><ul><li>En agosto, llega temprano: aparcar es más fácil y el sol más suave para los niños.</li><li>Lleva sombrilla y agua suficiente, sobre todo a las playas sin servicios.</li><li>El Levante (viento de levante) levanta olas en la playa; los días de Poniente suelen ser más tranquilos.</li><li>Acuerda con los niños un punto de encuentro claro junto al puesto de socorristas.</li></ul>' +
          '<h2>Otras playas que merecen la pena</h2><ul><li><a href="~/tourisme/dalia/">Playa Dalia</a>: tranquila y familiar.</li><li><a href="~/tourisme/zahara-hatba/">Zahara / Hatba</a>: olas normalmente suaves.</li><li><a href="~/tourisme/sidi-kankouch-2/">Sidi Kankouch 2</a>: mismo ambiente, menos gente.</li></ul>' +
          '<p>¿Algún dato ya no es correcto? <a href="~/contact/">Escríbenos</a> y actualizamos la guía.</p>'
      }
    }
  };

  var ferries = {
    slug: 'bateaux-tanger-med', section: 'guide', category: 'port', cover: 'assets/img/tanger-med-muk681ck.webp', gallery: [], map: '', lat: null, lng: null,
    date: '2026-10-09', updated: '2026-10-09', draft: false, featured: false, related: ['meilleures-plages-familles'], video: '', wx: 'off',
    i18n: {
      ar: {
        title: 'مواعيد البواخر في ميناء طنجة المتوسط: الجدول المباشر والخطوط',
        seoTitle: 'مواعيد البواخر طنجة المتوسط مباشر | الخطوط والنصائح',
        description: 'جدول وصول البواخر المباشر في ميناء طنجة المتوسط، خريطة الخطوط نحو الجزيرة الخضراء وبرشلونة وجنوة، المدة التقريبية ونصائح للمسافرين.',
        keyword: 'مواعيد البواخر طنجة المتوسط',
        alt: 'ميناء طنجة المتوسط قرب القصر الصغير',
        content:
          '<div class="facts"><div><b>~ 1h30</b><span>طنجة المتوسط ⇄ الجزيرة الخضراء</span></div><div><b>يومياً</b><span>رحلات متعددة في النهار والليل</span></div><div><b>قريب</b><span>من القصر الصغير عبر الطريق الساحلية</span></div></div>' +
          '<div class="warn">⚠️ <b>تنبيه قبل السفر:</b> المواعيد قابلة للتغيير في أي وقت، خصوصاً في أيام الرياح الشرقية القوية وضغط الصيف. هذه الصفحة ليست رسمية، والجدول المباشر معروض كما هو من ميناء طنجة المتوسط. <b>تأكد دائماً من رحلتك مع الشركة</b> التي حجزت معها، وكن في الميناء قبل الموعد بوقت كافٍ.</div>' +
          '<h2>جدول البواخر المباشر</h2><p>المعلومات تأتي مباشرة من لوحة الرحلات في ميناء طنجة المتوسط وتتحدث تلقائياً.</p><div data-block="tm-live"></div>' +
          '<h2>خريطة الخطوط بالقمر الصناعي</h2><p>ميناء طنجة المتوسط قريب من القصر الصغير، مقابل الجزيرة الخضراء في إسبانيا. المسارات مرسومة بشكل تقريبي عبر البحر، والمسار الحقيقي يختلف حسب الباخرة والطقس.</p><div data-block="ferry-map"></div>' +
          '<h2>الخطوط الرئيسية</h2><table><thead><tr><th>الخط</th><th>المدة التقريبية</th><th>ملاحظات</th></tr></thead><tbody>' +
          '<tr><td><b>طنجة المتوسط ⇄ الجزيرة الخضراء</b></td><td>~ 1h30</td><td>الأكثر رحلات، عدة شركات يومياً</td></tr>' +
          '<tr><td><b>طنجة المتوسط ⇄ برشلونة / جنوة</b></td><td>أكثر من يوم</td><td>رحلات طويلة، مناسبة لمن يسافر بسيارته نحو عمق أوروبا</td></tr>' +
          '<tr><td><b>طنجة المدينة ⇄ طريفة</b></td><td>~ 1h</td><td>تنطلق من ميناء طنجة المدينة وليس من طنجة المتوسط</td></tr></tbody></table>' +
          '<p>المدد تقريبية وتختلف حسب الباخرة والطقس. توجد خطوط وشركات أخرى حسب الموسم، والمرجع هو الجدول المباشر والشركات.</p>' +
          '<h2>نصائح عملية (ليست رسمية)</h2><ul><li><b>⏰ احضر مبكراً</b>، خاصة بالسيارة وفي الصيف؛ إجراءات الجمارك والحدود تأخذ وقتاً.</li><li><b>🌬️ راقب الشرقي:</b> الرياح الشرقية القوية قد تؤخر الرحلات أو تلغيها. اطلع على <a href="~/mer/">حالة البحر اليوم</a>.</li><li><b>🧳 الوثائق:</b> جواز سفر ساري المفعول، والتأشيرة إن كنت تحتاجها، ووثائق السيارة إن كنت مسافراً بها.</li><li><b>☀️ عملية مرحبا:</b> في الصيف يكثر المسافرون من الجالية؛ احجز مبكراً وتوقع الزحام.</li><li><b>🎫 التذاكر:</b> احجز من الموقع الرسمي للشركة أو من وكالة موثوقة، واحتفظ بتأكيد الحجز.</li></ul>' +
          '<h2>أسئلة متكررة</h2>' +
          '<details><summary>كم تستغرق الرحلة من طنجة المتوسط إلى الجزيرة الخضراء؟</summary><p>حوالي ساعة ونصف، وقد تختلف حسب الباخرة والطقس.</p></details>' +
          '<details><summary>أين أجد المواعيد المحدثة؟</summary><p>في الجدول المباشر أعلاه، وفي موقع Tanger Med Passagers الرسمي، ومع الشركة التي حجزت معها.</p></details>' +
          '<details><summary>هل يلغي الشرقي الرحلات؟</summary><p>في أيام الرياح القوية قد تتأخر الرحلات أو تُلغى. تأكد مع الشركة قبل الخروج.</p></details>' +
          '<details><summary>هل تنطلق رحلات طريفة من طنجة المتوسط؟</summary><p>لا، خط طريفة ينطلق عادة من ميناء طنجة المدينة. من طنجة المتوسط الخط الرئيسي هو الجزيرة الخضراء.</p></details>' +
          '<p><small>المصادر: لوحة الرحلات المباشرة لميناء طنجة المتوسط وموقع Tanger Med Passagers. صورة القمر الصناعي: Esri. هذا دليل إرشادي من موقع القصر الصغير وليس تابعاً لأي جهة رسمية.</small></p>'
      },
      fr: {
        title: 'Horaires des ferries au port de Tanger Med : direct et lignes',
        seoTitle: 'Horaires ferries Tanger Med en direct | Lignes et conseils',
        description: 'Arrivées des ferries en direct au port de Tanger Med, carte des lignes vers Algésiras, Barcelone et Gênes, durées approximatives et conseils aux voyageurs.',
        keyword: 'horaires ferry Tanger Med',
        alt: 'Le port de Tanger Med près de Ksar Sghir',
        content:
          '<div class="facts"><div><b>~ 1h30</b><span>Tanger Med ⇄ Algésiras</span></div><div><b>Tous les jours</b><span>Nombreuses traversées jour et nuit</span></div><div><b>Tout près</b><span>de Ksar Sghir par la route côtière</span></div></div>' +
          '<div class="warn">⚠️ <b>Avant de partir :</b> les horaires peuvent changer à tout moment, surtout par fort vent d’est et en pleine saison. Cette page n’est pas officielle ; le tableau en direct est affiché tel quel depuis le port de Tanger Med. <b>Vérifiez toujours votre traversée auprès de la compagnie</b> et arrivez au port bien en avance.</div>' +
          '<h2>Tableau des ferries en direct</h2><p>Les informations proviennent directement du tableau des traversées du port de Tanger Med et se mettent à jour seules.</p><div data-block="tm-live"></div>' +
          '<h2>Carte satellite des lignes</h2><p>Le port de Tanger Med est tout près de Ksar Sghir, face à Algésiras en Espagne. Les tracés sont approximatifs ; la route réelle dépend du navire et de la météo.</p><div data-block="ferry-map"></div>' +
          '<h2>Lignes principales</h2><table><thead><tr><th>Ligne</th><th>Durée approx.</th><th>Remarques</th></tr></thead><tbody>' +
          '<tr><td><b>Tanger Med ⇄ Algésiras</b></td><td>~ 1h30</td><td>La plus fréquente, plusieurs compagnies chaque jour</td></tr>' +
          '<tr><td><b>Tanger Med ⇄ Barcelone / Gênes</b></td><td>Plus d’un jour</td><td>Longues traversées, pratiques en voiture vers le cœur de l’Europe</td></tr>' +
          '<tr><td><b>Tanger Ville ⇄ Tarifa</b></td><td>~ 1h</td><td>Part du port de Tanger Ville, pas de Tanger Med</td></tr></tbody></table>' +
          '<p>Durées indicatives selon le navire et la météo. D’autres lignes et compagnies existent selon la saison ; la référence reste le tableau en direct et les compagnies.</p>' +
          '<h2>Conseils pratiques (non officiels)</h2><ul><li><b>⏰ Arrivez tôt</b>, surtout en voiture et l’été : douane et police prennent du temps.</li><li><b>🌬️ Surveillez le Levante :</b> un fort vent d’est peut retarder ou annuler les traversées. Voir <a href="~/mer/">la mer aujourd’hui</a>.</li><li><b>🧳 Documents :</b> passeport valide, visa si nécessaire, papiers du véhicule.</li><li><b>☀️ Opération Marhaba :</b> l’été, l’affluence est forte ; réservez tôt.</li><li><b>🎫 Billets :</b> réservez sur le site officiel de la compagnie ou via une agence fiable et gardez la confirmation.</li></ul>' +
          '<h2>Questions fréquentes</h2>' +
          '<details><summary>Combien dure la traversée Tanger Med – Algésiras ?</summary><p>Environ une heure et demie, selon le navire et la météo.</p></details>' +
          '<details><summary>Où trouver les horaires à jour ?</summary><p>Dans le tableau en direct ci-dessus, sur le site officiel Tanger Med Passagers et auprès de votre compagnie.</p></details>' +
          '<details><summary>Le Levante annule-t-il les traversées ?</summary><p>Par vent fort, des retards ou annulations sont possibles. Vérifiez avec la compagnie avant de partir.</p></details>' +
          '<details><summary>Les ferries pour Tarifa partent-ils de Tanger Med ?</summary><p>Non, la ligne de Tarifa part en général du port de Tanger Ville. Depuis Tanger Med, la ligne principale est Algésiras.</p></details>' +
          '<p><small>Sources : tableau en direct du port de Tanger Med et site Tanger Med Passagers. Image satellite : Esri. Guide indicatif du site Ksar Sghir, sans lien avec un organisme officiel.</small></p>'
      },
      en: {
        title: 'Tanger Med ferry times: live board and routes',
        seoTitle: 'Tanger Med ferry times live | Routes and travel tips',
        description: 'Live ferry arrivals at Tanger Med port, a map of routes to Algeciras, Barcelona and Genoa, approximate crossing times and practical tips for travellers.',
        keyword: 'Tanger Med ferry times',
        alt: 'Tanger Med port near Ksar Sghir',
        content:
          '<div class="facts"><div><b>~ 1h30</b><span>Tanger Med ⇄ Algeciras</span></div><div><b>Daily</b><span>Many crossings day and night</span></div><div><b>Nearby</b><span>from Ksar Sghir along the coast road</span></div></div>' +
          '<div class="warn">⚠️ <b>Before you travel:</b> times can change at any moment, especially on strong easterly wind days and in peak summer. This page is not official; the live board is shown as-is from Tanger Med port. <b>Always confirm your sailing with the ferry company</b> and get to the port well ahead of time.</div>' +
          '<h2>Live ferry board</h2><p>The information comes straight from Tanger Med port’s sailings board and updates on its own.</p><div data-block="tm-live"></div>' +
          '<h2>Satellite map of the routes</h2><p>Tanger Med port is close to Ksar Sghir, opposite Algeciras in Spain. Routes are drawn approximately; the actual track depends on the ship and the weather.</p><div data-block="ferry-map"></div>' +
          '<h2>Main routes</h2><table><thead><tr><th>Route</th><th>Approx. time</th><th>Notes</th></tr></thead><tbody>' +
          '<tr><td><b>Tanger Med ⇄ Algeciras</b></td><td>~ 1h30</td><td>Most frequent, several companies daily</td></tr>' +
          '<tr><td><b>Tanger Med ⇄ Barcelona / Genoa</b></td><td>Over a day</td><td>Long crossings, handy if driving deep into Europe</td></tr>' +
          '<tr><td><b>Tanger Ville ⇄ Tarifa</b></td><td>~ 1h</td><td>Leaves from Tanger Ville port, not Tanger Med</td></tr></tbody></table>' +
          '<p>Times are approximate and vary with the ship and weather. Other routes and companies run depending on the season; the live board and the companies are the reference.</p>' +
          '<h2>Practical tips (unofficial)</h2><ul><li><b>⏰ Arrive early</b>, especially by car and in summer: customs and border checks take time.</li><li><b>🌬️ Watch the Levante:</b> strong easterly winds can delay or cancel sailings. See <a href="~/mer/">today’s sea</a>.</li><li><b>🧳 Documents:</b> a valid passport, a visa if you need one, and your vehicle papers.</li><li><b>☀️ Operation Marhaba:</b> summer brings very heavy traffic; book early.</li><li><b>🎫 Tickets:</b> book on the company’s official site or through a trusted agency and keep your confirmation.</li></ul>' +
          '<h2>FAQ</h2>' +
          '<details><summary>How long is the Tanger Med – Algeciras crossing?</summary><p>About an hour and a half, depending on the ship and weather.</p></details>' +
          '<details><summary>Where can I find up-to-date times?</summary><p>On the live board above, on the official Tanger Med Passagers site and with your ferry company.</p></details>' +
          '<details><summary>Does the Levante cancel sailings?</summary><p>On very windy days sailings may be delayed or cancelled. Check with the company before setting off.</p></details>' +
          '<details><summary>Do Tarifa ferries leave from Tanger Med?</summary><p>No, the Tarifa route usually leaves from Tanger Ville port. From Tanger Med the main route is Algeciras.</p></details>' +
          '<p><small>Sources: Tanger Med port live board and the Tanger Med Passagers website. Satellite imagery: Esri. A guidance page from the Ksar Sghir website, not affiliated with any official body.</small></p>'
      },
      es: {
        title: 'Horarios de ferris en el puerto de Tánger Med: en directo y líneas',
        seoTitle: 'Horarios ferry Tánger Med en directo | Líneas y consejos',
        description: 'Llegadas de ferris en directo al puerto de Tánger Med, mapa de líneas a Algeciras, Barcelona y Génova, duración aproximada y consejos para viajeros.',
        keyword: 'horarios ferry Tánger Med',
        alt: 'Puerto de Tánger Med cerca de Alcazarseguer',
        content:
          '<div class="facts"><div><b>~ 1h30</b><span>Tánger Med ⇄ Algeciras</span></div><div><b>A diario</b><span>Muchas salidas de día y de noche</span></div><div><b>Muy cerca</b><span>de Alcazarseguer por la carretera de la costa</span></div></div>' +
          '<div class="warn">⚠️ <b>Antes de viajar:</b> los horarios pueden cambiar en cualquier momento, sobre todo con Levante fuerte y en pleno verano. Esta página no es oficial; el panel en directo se muestra tal cual desde el puerto de Tánger Med. <b>Confirma siempre tu salida con la naviera</b> y llega al puerto con tiempo.</div>' +
          '<h2>Panel de ferris en directo</h2><p>La información llega directamente del panel de salidas del puerto de Tánger Med y se actualiza sola.</p><div data-block="tm-live"></div>' +
          '<h2>Mapa satélite de las líneas</h2><p>El puerto de Tánger Med está muy cerca de Alcazarseguer, frente a Algeciras. Las rutas son aproximadas; el trayecto real depende del barco y del tiempo.</p><div data-block="ferry-map"></div>' +
          '<h2>Líneas principales</h2><table><thead><tr><th>Línea</th><th>Duración aprox.</th><th>Notas</th></tr></thead><tbody>' +
          '<tr><td><b>Tánger Med ⇄ Algeciras</b></td><td>~ 1h30</td><td>La más frecuente, varias navieras cada día</td></tr>' +
          '<tr><td><b>Tánger Med ⇄ Barcelona / Génova</b></td><td>Más de un día</td><td>Travesías largas, útiles si viajas en coche al centro de Europa</td></tr>' +
          '<tr><td><b>Tánger Ciudad ⇄ Tarifa</b></td><td>~ 1h</td><td>Sale del puerto de Tánger Ciudad, no de Tánger Med</td></tr></tbody></table>' +
          '<p>Duraciones orientativas según el barco y el tiempo. Hay otras líneas y navieras según la temporada; la referencia es el panel en directo y las navieras.</p>' +
          '<h2>Consejos prácticos (no oficiales)</h2><ul><li><b>⏰ Llega temprano</b>, sobre todo en coche y en verano: aduana y frontera llevan tiempo.</li><li><b>🌬️ Ojo con el Levante:</b> el viento fuerte de levante puede retrasar o cancelar salidas. Mira <a href="~/mer/">el mar hoy</a>.</li><li><b>🧳 Documentos:</b> pasaporte en vigor, visado si lo necesitas y papeles del vehículo.</li><li><b>☀️ Operación Paso del Estrecho (Marhaba):</b> en verano hay muchísima gente; reserva pronto.</li><li><b>🎫 Billetes:</b> reserva en la web oficial de la naviera o en una agencia fiable y guarda la confirmación.</li></ul>' +
          '<h2>Preguntas frecuentes</h2>' +
          '<details><summary>¿Cuánto dura el trayecto Tánger Med – Algeciras?</summary><p>Alrededor de hora y media, según el barco y el tiempo.</p></details>' +
          '<details><summary>¿Dónde veo los horarios actualizados?</summary><p>En el panel en directo de arriba, en la web oficial de Tanger Med Passagers y con tu naviera.</p></details>' +
          '<details><summary>¿El Levante cancela los ferris?</summary><p>Con viento fuerte puede haber retrasos o cancelaciones. Confírmalo con la naviera antes de salir.</p></details>' +
          '<details><summary>¿Los ferris a Tarifa salen de Tánger Med?</summary><p>No, la línea de Tarifa suele salir del puerto de Tánger Ciudad. Desde Tánger Med la línea principal es Algeciras.</p></details>' +
          '<p><small>Fuentes: panel en directo del puerto de Tánger Med y web Tanger Med Passagers. Imagen satélite: Esri. Guía orientativa de la web de Alcazarseguer, sin relación con ningún organismo oficial.</small></p>'
      }
    }
  };

  var api = { articles: [beaches, ferries] };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KS_SEED_V10 = api;
})(this);
