const API_URL =
'https://script.google.com/macros/s/AKfycbxW7Va1ry6Qvg_HTcmsbH5lUkpZvtcuf3pFhEynZo2yh3X3anl1igsVw-3buY0l-Hjj0A/exec';


const params =
  new URLSearchParams(
    location.search
  );


let CLUB =
  (
    params.get('club') ||
    ''
  )
  .trim();


const state = {

  club:null,

  blazons:[],

  spots:[],

  pricing:[],

  news:[],

  session:'',

  coach:null,

  divers:[]

};


const pendingPosts =
  new Map();


/* =========================================================
   NOMS DES PLONGEONS
========================================================= */

const DIVE_NAMES = {

  '001A':'Chute avant droite',

  '001B':'Chute avant carpée',

  '001C':'Chute avant groupée',

  '002A':'Chute arrière droite',

  '002AS':'Plongeon arrière droit en sautant',

  '100A':'Chandelle avant droite',

  '101C':'Plongeon avant groupé',

  '102C':'1 salto avant groupé',

  '103C':'1½ salto avant groupé',

  '104C':'2 saltos avant groupés',

  '105C':'2½ saltos avant groupés',

  '105B':'2½ saltos avant carpés',

  '107C':'3½ saltos avant groupés',

  '107B':'3½ saltos avant carpés',

  '109C':'4½ saltos avant groupés',

  '109B':'4½ saltos avant carpés',

  '1011C':'5½ saltos avant groupés',


  '201C':'Plongeon arrière groupé',

  '201B':'Plongeon arrière carpé',

  '202C':'1 salto arrière groupé',

  '203C':'1½ salto arrière groupé',

  '203B':'1½ salto arrière carpé',

  '204C':'2 saltos arrière groupés',

  '205C':'2½ saltos arrière groupés',

  '205B':'2½ saltos arrière carpés',

  '207C':'3½ saltos arrière groupés',

  '207B':'3½ saltos arrière carpés',

  '209C':'4½ saltos arrière groupés',


  '301C':'Plongeon renversé groupé',

  '301B':'Plongeon renversé carpé',

  '302C':'1 salto renversé groupé',

  '303C':'1½ salto renversé groupé',

  '303B':'1½ salto renversé carpé',

  '304C':'2 saltos renversés groupés',

  '305C':'2½ saltos renversés groupés',

  '305B':'2½ saltos renversés carpés',

  '307C':'3½ saltos renversés groupés',

  '307B':'3½ saltos renversés carpés',

  '309C':'4½ saltos renversés groupés',


  '401C':'Plongeon retourné groupé',

  '402C':'1 salto retourné groupé',

  '403C':'1½ salto retourné groupé',

  '403B':'1½ salto retourné carpé',

  '404C':'2 saltos retournés groupés',

  '405C':'2½ saltos retournés groupés',

  '405B':'2½ saltos retournés carpés',

  '407C':'3½ saltos retournés groupés',

  '407B':'3½ saltos retournés carpés',

  '409C':'4½ saltos retournés groupés',


  '5122A':'1 salto avant + 1 vrille, droit',

  '5132D':'1½ salto avant + 1 vrille, libre',

  '5134D':'1½ salto avant + 2 vrilles, libre',

  '5152B':'2½ saltos avant + 1 vrille, carpé',

  '5153B':'2½ saltos avant + 1½ vrille, carpé',

  '5154B':'2½ saltos avant + 2 vrilles, carpé',

  '5162B':'3 saltos avant + 1 vrille, carpé',

  '5163B':'3 saltos avant + 1½ vrille, carpé',


  '5211A':'Plongeon arrière + ½ vrille, droit',

  '5221A':'1 salto arrière + ½ vrille, droit',

  '5223D':'1 salto arrière + 1½ vrille, libre',

  '5231D':'1½ salto arrière + ½ vrille, libre',

  '5233D':'1½ salto arrière + 1½ vrille, libre',

  '5235D':'1½ salto arrière + 2½ vrilles, libre',

  '5253B':'2½ saltos arrière + 1½ vrille, carpé',

  '5255B':'2½ saltos arrière + 2½ vrilles, carpé',

  '5257B':'2½ saltos arrière + 3½ vrilles, carpé',

  '5263B':'3 saltos arrière + 1½ vrille, carpé',


  '5321A':'1 salto renversé + ½ vrille, droit',

  '5323D':'1 salto renversé + 1½ vrille, libre',

  '5331D':'1½ salto renversé + ½ vrille, libre',

  '5333D':'1½ salto renversé + 1½ vrille, libre',

  '5335D':'1½ salto renversé + 2½ vrilles, libre',

  '5337D':'1½ salto renversé + 3½ vrilles, libre',

  '5339D':'1½ salto renversé + 4½ vrilles, libre',

  '5353B':'2½ saltos renversés + 1½ vrille, carpé',


  '616C':'Équilibre avant + 3 saltos groupés',

  '6243D':'Équilibre arrière + 2 saltos + 1½ vrille, libre',

  '626C':'Équilibre arrière + 3 saltos groupés',

  '628C':'Équilibre arrière + 4 saltos groupés'

};


/* =========================================================
   CRITÈRES EAH
========================================================= */

const CRITERIA = {

  D:[

    'Coordination / élan (si applicable)',

    'Impulsion / détente / élévation',

    'Trajectoire verticale',

    'Temps de fixation',

    'Amplitude des bras'

  ],


  T:[

    'Vitesse des rotations',

    'Saltos et/ou vrilles contrôlés',

    'Ligne / tenue / position du corps',

    'Ouverture (si applicable)',

    'Continuité / rythme'

  ],


  E:[

    'Angle vertical (si applicable)',

    'Éclaboussures / tolérance discipline',

    'Position des bras',

    'Jambes tendues et serrées',

    'Axe d’entrée'

  ]

};


/* =========================================================
   IMAGES BLAZONS V2
========================================================= */

const BLAZON_IMAGES = {

  BLANC:
    'blazon-blanc.png',

  ORANGE:
    'blazon-orange.png',

  VERT:
    'blazon-vert.png',

  BLEU:
    'blazon-bleu.png',

  ROUGE:
    'blazon-rouge.png',

  BRONZE:
    'blazon-bronze.png',

  ARGENT:
    'blazon-argent.png',

  SILVER:
    'blazon-argent.png',

  OR:
    'blazon-or.png',

  GOLD:
    'blazon-or.png',

  NOIR:
    'blazon-noir.png',

  LEGEND:
    'blazon-legend.png',

  'LÉGENDE':
    'blazon-legend.png',

  TITAN:
    'blazon-titan.png'

};


/* =========================================================
   NAVIGATION
========================================================= */

const pages =
  document.querySelectorAll(
    '.page'
  );


const navLinks =
  document.querySelectorAll(
    '[data-page]'
  );


const mobileMenu =
  document.getElementById(
    'mobileMenu'
  );


const navigation =
  document.getElementById(
    'navigation'
  );


function showPage(
  name
) {

  pages.forEach(
    page =>
      page.classList.toggle(
        'active',
        page.id === name
      )
  );


  if (
    location.hash !==
    '#' + name
  ) {

    history.replaceState(
      null,
      '',
      '#' + name
    );

  }


  scrollTo({

    top:0,

    behavior:'smooth'

  });


  navigation
    ?.classList
    .remove(
      'open'
    );

}


navLinks.forEach(
  link => {

    link.addEventListener(
      'click',
      event => {

        const page =
          link.dataset.page;


        if (!page) {
          return;
        }


        event.preventDefault();


        showPage(
          page
        );

      }
    );

  }
);


document
  .querySelectorAll(
    '[data-open]'
  )
  .forEach(
    card => {

      card.addEventListener(
        'click',
        () =>
          showPage(
            card.dataset.open
          )
      );

    }
  );


mobileMenu
  ?.addEventListener(
    'click',
    () =>
      navigation.classList.toggle(
        'open'
      )
  );


addEventListener(
  'hashchange',
  () => {

    const hash =
      location.hash.slice(
        1
      );


    if (
      document.getElementById(
        hash
      )
    ) {

      showPage(
        hash
      );

    }

  }
);


/* =========================================================
   MODAL
========================================================= */

const siteModal =
  document.getElementById(
    'siteModal'
  );


const modalContent =
  document.getElementById(
    'modalContent'
  );


function openModal(
  html
) {

  modalContent.innerHTML =
    html;


  siteModal.classList.add(
    'show'
  );


  siteModal.setAttribute(
    'aria-hidden',
    'false'
  );


  document.body.classList.add(
    'modal-open'
  );

}


function closeModal() {

  siteModal.classList.remove(
    'show'
  );


  siteModal.setAttribute(
    'aria-hidden',
    'true'
  );


  document.body.classList.remove(
    'modal-open'
  );

}


document.addEventListener(
  'click',
  event => {

    if (
      event.target.matches(
        '[data-close-modal]'
      )
    ) {

      closeModal();

    }

  }
);


document.addEventListener(
  'keydown',
  event => {

    if (
      event.key ===
      'Escape'
    ) {

      closeModal();

    }

  }
);


/* =========================================================
   MODALES GRADING
========================================================= */

const gradingSheets = {

  D:{

    title:
      'Takeoff — Départ',

    image:
      'grading-takeoff.png',

    intro:
      'Le Takeoff analyse la préparation et le départ.'

  },


  T:{

    title:
      'Trick — Phase aérienne',

    image:
      'grading-trick.png',

    intro:
      'Le Trick analyse la qualité de la phase aérienne.'

  },


  E:{

    title:
      "Entry — Entrée à l'eau",

    image:
      'grading-entry.png',

    intro:
      "L'Entry analyse la phase terminale et la qualité de l'entrée."

  }

};


document
  .querySelectorAll(
    '.grading-card[data-sheet]'
  )
  .forEach(
    card => {

      card.addEventListener(
        'click',
        () => {

          const sheet =
            gradingSheets[
              card.dataset.sheet
            ];


          openModal(
            `
            <div class="modal-inner">

              <span class="overline">
                GRILLE EAH
              </span>

              <h2>
                ${sheet.title}
              </h2>

              <p>
                ${sheet.intro}
              </p>

              <div class="modal-note">

                5 éléments par critère :

                2 Validé,

                1 Partiel,

                0 Non validé

                ou N/A.

              </div>

              <img
                class="modal-image"
                src="${sheet.image}"
                alt="${sheet.title}"
              >

            </div>
            `
          );

        }
      );

    }
  );


/* =========================================================
   CONSEILS
========================================================= */

const adviceTopics = {

  avant:{

    title:
      'Salto avant',

    description:
      "Trajectoire, engagement du départ, fluidité de rotation et contrôle de l'entrée."

  },


  arriere:{

    title:
      'Salto arrière',

    description:
      "Repère de départ, poussée, maîtrise de l'axe et contrôle final."

  },


  renverse:{

    title:
      'Renversé',

    description:
      'Élévation, retour maîtrisé, verticalité, repères et ouverture.'

  },


  retourne:{

    title:
      'Retourné',

    description:
      'Engagement précis, lignes et contrôle du corps.'

  },


  vrille:{

    title:
      'Vrille',

    description:
      "Axe, dissociation, continuité et stabilité de l'exécution."

  }

};


document
  .querySelectorAll(
    '.advice-card[data-advice]'
  )
  .forEach(
    card => {

      card.addEventListener(
        'click',
        () => {

          const topic =
            adviceTopics[
              card.dataset.advice
            ];


          openModal(
            `
            <div class="modal-inner">

              <span class="overline">
                CONSEIL EAH
              </span>

              <h2>
                ${topic.title}
              </h2>

              <p>
                ${topic.description}
              </p>

            </div>
            `
          );

        }
      );

    }
  );


/* =========================================================
   OUTILS
========================================================= */

function esc(
  value
) {

  return String(
    value ?? ''
  )
  .replace(
    /[&<>"']/g,
    char => ({

      '&':'&amp;',

      '<':'&lt;',

      '>':'&gt;',

      '"':'&quot;',

      "'":'&#39;'

    }[char])
  );

}


function fmtDate(
  value
) {

  if (!value) {
    return '';
  }


  const date =
    new Date(
      value
    );


  return isNaN(
    date
  )
  ?
  String(
    value
  )
  :
  date.toLocaleDateString(
    'fr-FR'
  );

}


function val(
  id
) {

  return document
    .getElementById(
      id
    )
    .value;

}


function truthy(
  value
) {

  return (
    value === true
    ||
    [
      'TRUE',
      '1',
      'YES',
      'OUI',
      'ON'
    ]
    .includes(
      String(
        value ?? ''
      )
      .trim()
      .toUpperCase()
    )
  );

}


function driveImage(
  url
) {

  if (!url) {
    return '';
  }


  const source =
    String(
      url
    );


  const match =
    source.match(
      /\/file\/d\/([a-zA-Z0-9_-]+)/
    )
    ||
    source.match(
      /[?&]id=([a-zA-Z0-9_-]+)/
    );


  return match
  ?
  (
    'https://drive.google.com/thumbnail?id='
    +
    match[1]
    +
    '&sz=w1600'
  )
  :
  source;

}


function blazonImage(
  name
) {

  return (
    BLAZON_IMAGES[
      String(
        name || ''
      )
      .trim()
      .toUpperCase()
    ]
    ||
    ''
  );

}


/* =========================================================
   RETOUR APPS SCRIPT IFRAME
========================================================= */

window.addEventListener(
  'message',
  event => {

    const msg =
      event.data ||
      {};


    if (
      !msg.requestId
      ||
      !pendingPosts.has(
        msg.requestId
      )
    ) {

      return;

    }


    const pending =
      pendingPosts.get(
        msg.requestId
      );


    pendingPosts.delete(
      msg.requestId
    );


    pending.resolve(
      msg.data
    );

  }
);


/* =========================================================
   APPEL GET JSONP
========================================================= */

function getJSON(
  action,
  extra = {}
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const callback =
        'cb_'
        +
        Date.now()
        +
        '_'
        +
        Math.random()
          .toString(36)
          .slice(2);


      const script =
        document.createElement(
          'script'
        );


      window[
        callback
      ] =
        data => {

          resolve(
            data
          );


          delete window[
            callback
          ];


          script.remove();

        };


      script.src =
        API_URL
        +
        '?'
        +
        new URLSearchParams({

          action,

          callback,

          ...extra

        })
        .toString();


      script.onerror =
        () => {

          reject(
            new Error(
              'Impossible de joindre Apps Script'
            )
          );


          delete window[
            callback
          ];


          script.remove();

        };


      document.body.appendChild(
        script
      );

    }
  );

}


/* =========================================================
   APPEL POST IFRAME
========================================================= */

function postIframe(
  data
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const requestId =
        'req_'
        +
        Date.now()
        +
        '_'
        +
        Math.random()
          .toString(36)
          .slice(2);


      pendingPosts.set(
        requestId,
        {
          resolve,
          reject
        }
      );


      const form =
        document.createElement(
          'form'
        );


      form.method =
        'POST';


      form.action =
        API_URL;


      form.target =
        'apiFrame';


      form.style.display =
        'none';


      Object
        .entries({

          ...data,

          transport:
            'iframe',

          requestId

        })
        .forEach(
          ([key,value]) => {

            const input =
              document.createElement(
                'textarea'
              );


            input.name =
              key;


            input.value =
              value == null
              ?
              ''
              :
              String(
                value
              );


            form.appendChild(
              input
            );

          }
        );


      document.body.appendChild(
        form
      );


      form.submit();


      setTimeout(
        () =>
          form.remove(),
        1000
      );


      setTimeout(
        () => {

          if (
            pendingPosts.has(
              requestId
            )
          ) {

            pendingPosts.delete(
              requestId
            );


            reject(
              new Error(
                'Délai dépassé'
              )
            );

          }

        },
        120000
      );

    }
  );

}


/* =========================================================
   INITIALISATION
========================================================= */

async function init() {

  renderCriteria();

  renderDiveList();


  const requests = [

    getJSON(
      'blazons'
    )
    .catch(
      () => ({
        ok:false,
        items:[]
      })
    ),


    getJSON(
      'pricing'
    )
    .catch(
      () => ({
        ok:false,
        items:[]
      })
    ),


    getJSON(
      'spots'
    )
    .catch(
      () => ({
        ok:false,
        items:[]
      })
    ),


    getJSON(
      'news'
    )
    .catch(
      () => ({
        ok:false,
        items:[]
      })
    )

  ];


  if (CLUB) {

    requests.push(

      getJSON(
        'club',
        {
          club:
            CLUB
        }
      )
      .catch(
        () => ({
          ok:false
        })
      )

    );

  }


  const [
    blazons,
    pricing,
    spots,
    news,
    club
  ] =
  await Promise.all(
    requests
  );


  state.blazons =
    blazons?.ok
    ?
    (
      blazons.items ||
      []
    )
    :
    [];


  renderBlazons();


  state.pricing =
    pricing?.ok
    ?
    (
      pricing.items ||
      []
    )
    :
    [];


  renderPricing();


  state.spots =
    spots?.ok
    ?
    (
      spots.items ||
      []
    )
    .filter(
      item =>
        item.active === undefined
        ||
        truthy(
          item.active
        )
    )
    :
    [];


  state.spots.sort(
    (
      a,
      b
    ) =>
      (
        Number(
          a.order
        )
        ||
        9999
      )
      -
      (
        Number(
          b.order
        )
        ||
        9999
      )
  );


  renderSpots();

  renderSpotSelect();


  state.news =
    news?.ok
    ?
    (
      news.items ||
      []
    )
    .filter(
      item =>
        item.active === undefined
        ||
        truthy(
          item.active
        )
    )
    :
    [];


  state.news.sort(
    (
      a,
      b
    ) =>
      (
        Number(
          a.order
        )
        ||
        9999
      )
      -
      (
        Number(
          b.order
        )
        ||
        9999
      )
  );


  renderNews();


  if (
    CLUB &&
    club?.ok
  ) {

    state.club =
      club.club;


    renderClubIdentity(
      club.club
    );


    showClubLogin();

  } else if (CLUB) {

    document
      .getElementById(
        'clubOpenMsg'
      )
      .innerHTML =
      `
      <div class="notice error">
        Club introuvable.
      </div>
      `;

  }


  const id =
    params.get(
      'id'
    );


  const token =
    params.get(
      'token'
    );


  if (
    id &&
    token
  ) {

    document
      .getElementById(
        'profileId'
      )
      .value =
      id;


    document
      .getElementById(
        'profileToken'
      )
      .value =
      token;


    showPage(
      'profil'
    );


    loadProfileManual();

  } else {

    const hash =
      location.hash.slice(
        1
      );


    showPage(
      document.getElementById(
        hash
      )
      ?
      hash
      :
      'accueil'
    );

  }

}


/* =========================================================
   CLUB
========================================================= */

function renderClubIdentity(
  club
) {

  const box =
    document.getElementById(
      'clubIdentity'
    );


  box.classList.remove(
    'hidden'
  );


  box.innerHTML =
  `
  ${
    club.logoUrl
    ?
    `
    <img
      src="${esc(driveImage(club.logoUrl))}"
      alt="${esc(club.name)}"
    >
    `
    :
    ''
  }

  <div>

    <span class="overline">
      ESPACE CLUB
    </span>

    <h2>
      ${esc(
        club.name ||
        'EAH Diving Club'
      )}
    </h2>

    <p>
      ${esc(
        club.welcomeText ||
        'EAH fournit l’outil. Le coach reste le coach.'
      )}
    </p>

    ${
      club.city
      ?
      `
      <span class="pill">
        ${esc(club.city)}
      </span>
      `
      :
      ''
    }

  </div>
  `;


  document
    .getElementById(
      'privateClubTitle'
    )
    .textContent =
      club.name ||
      'EAH Diving Club';

}


function showClubLogin() {

  document
    .getElementById(
      'clubSelector'
    )
    .classList
    .add(
      'hidden'
    );


  document
    .getElementById(
      'loginBox'
    )
    .classList
    .remove(
      'hidden'
    );

}


async function openClubFromInput() {

  const slug =
    val(
      'clubSlugInput'
    )
    .trim()
    .toLowerCase();


  const msg =
    document.getElementById(
      'clubOpenMsg'
    );


  if (!slug) {

    msg.innerHTML =
      `
      <div class="notice error">
        Entre le code du club.
      </div>
      `;

    return;

  }


  msg.innerHTML =
    `
    <div class="notice">
      Chargement…
    </div>
    `;


  try {

    const result =
      await getJSON(
        'club',
        {
          club:
            slug
        }
      );


    if (
      !result.ok
    ) {

      throw new Error(
        result.error ||
        'Club introuvable'
      );

    }


    CLUB =
      slug;


    state.club =
      result.club;


    const url =
      new URL(
        location.href
      );


    url.searchParams.set(
      'club',
      slug
    );


    history.replaceState(
      null,
      '',
      url.pathname
      +
      '?'
      +
      url.searchParams.toString()
      +
      '#club'
    );


    renderClubIdentity(
      result.club
    );


    showClubLogin();


    msg.innerHTML =
      '';

  } catch(error) {

    msg.innerHTML =
      `
      <div class="notice error">
        ${esc(error.message)}
      </div>
      `;

  }

}


/* =========================================================
   CRITÈRES
========================================================= */

function renderCriteria() {

  Object
    .entries(
      CRITERIA
    )
    .forEach(
      ([prefix,items]) => {

        document
          .getElementById(
            'criteria' +
            prefix
          )
          .innerHTML =
          items
            .map(
              (
                text,
                index
              ) =>
              `
              <div>

                <strong>
                  ${prefix}${index + 1}
                </strong>

                —

                ${esc(text)}

              </div>


              <select
                id="${prefix}${index + 1}"
              >

                <option value="2">
                  2 — Validé
                </option>

                <option value="1">
                  1 — Partiel
                </option>

                <option value="0">
                  0 — Non validé
                </option>

                <option value="NA">
                  N/A
                </option>

              </select>
              `
            )
            .join('');

      }
    );

}


/* =========================================================
   LISTE DES PLONGEONS
========================================================= */

function renderDiveList() {

  document
    .getElementById(
      'diveCodes'
    )
    .innerHTML =
    Object
      .entries(
        DIVE_NAMES
      )
      .map(
        ([code,name]) =>
        `
        <option value="${code}">
          ${esc(name)}
        </option>
        `
      )
      .join('');

}


function fillDiveName() {

  const code =
    val(
      'diveCode'
    )
    .toUpperCase();


  if (
    DIVE_NAMES[
      code
    ]
  ) {

    document
      .getElementById(
        'diveName'
      )
      .value =
      DIVE_NAMES[
        code
      ];

  }

}


/* =========================================================
   BLAZONS V2
========================================================= */

function renderBlazons() {

  const grid =
    document.getElementById(
      'blazonGrid'
    );


  if (
    !state.blazons.length
  ) {

    grid.innerHTML =
      `
      <div class="notice">
        Aucun blazon reçu depuis Apps Script.
      </div>
      `;

    return;

  }


  grid.innerHTML =
    state.blazons
      .map(
        (
          blazon,
          index
        ) => {

          const image =
            blazonImage(
              blazon.name
            )
            ||
            driveImage(
              blazon.imageUrl ||
              ''
            );


          const summary =
            (
              blazon.rules &&
              blazon.rules.summary
            )
            ||
            'Référentiel V2 EAH Diving';


          return `
          <article
            class="blazon-card"
            onclick="openBlazon(${index})"
          >

            ${
              image
              ?
              `
              <img
                src="${esc(image)}"
                alt="${esc(blazon.name)}"
                onerror="this.style.display='none'"
              >
              `
              :
              ''
            }

            <h3>
              ${esc(blazon.name)}
            </h3>

            <p>
              ${esc(summary)}
            </p>

          </article>
          `;

        }
      )
      .join('');

}


function openBlazon(
  index
) {

  const blazon =
    state.blazons[
      index
    ];


  const rules =
    blazon.rules ||
    {};


  let html =
  `
  <div class="modal-inner">

    <span class="overline">
      RÉFÉRENTIEL V2
    </span>

    <h2>
      ${esc(blazon.name)}
    </h2>

    <div class="modal-note">
      ${esc(
        rules.summary ||
        ''
      )}
    </div>
  `;


  const allSeries = [

    ...(
      rules.series ||
      []
    ),

    ...(
      rules.options ||
      []
    ),

    ...(
      rules.fullSeriesOptions ||
      []
    )

  ];


  allSeries.forEach(
    series => {

      html +=
      `
      <div class="modal-note">

        <h3>
          ${esc(
            series.label
            ||
            (
              series.height === 0
              ?
              'Bord / plot'
              :
              series.height + ' m'
            )
          )}
        </h3>
      `;


      if (
        series.minWa !== undefined
        ||
        series.minEah !== undefined
      ) {

        html +=
        `
        <p>

          <strong>
            Validation :
          </strong>

          ${esc(series.minWa ?? '—')}/10
          World Aquatics

          OU

          ${esc(series.minEah ?? '—')}/10
          EAH Diving

        </p>
        `;

      }


      if (
        series.alternativeHeights
      ) {

        html +=
        `
        <p>

          <strong>
            Hauteurs alternatives :
          </strong>

          ${
            series
              .alternativeHeights
              .map(
                height =>
                  esc(height)
                  +
                  ' m'
              )
              .join(
                ' • '
              )
          }

        </p>
        `;

      }


      (
        series.codes ||
        []
      )
      .forEach(
        code => {

          if (
            series.choiceGroups
            &&
            series.choiceGroups[
              code
            ]
          ) {

            html +=
            `
            <p>

              <strong>
                Au choix :
              </strong>

              <br>

              ${
                series
                  .choiceGroups[
                    code
                  ]
                  .map(
                    option =>
                      `${esc(option)} — ${esc(DIVE_NAMES[option] || '')}`
                  )
                  .join(
                    '<br>'
                  )
              }

            </p>
            `;

          } else {

            html +=
            `
            <p>

              <strong>
                ${esc(code)}
              </strong>

              —

              ${esc(DIVE_NAMES[code] || '')}

            </p>
            `;

          }

        }
      );


      html +=
        `
        </div>
        `;

    }
  );


  openModal(
    html +
    '</div>'
  );

}


/* =========================================================
   TARIFS
========================================================= */

function renderPricing() {

  const grid =
    document.getElementById(
      'pricingGrid'
    );


  if (
    !state.pricing.length
  ) {

    grid.innerHTML =
      `
      <div class="notice">
        Tarifs non disponibles.
      </div>
      `;

    return;

  }


  grid.innerHTML =
    state.pricing
      .map(
        item =>
        `
        <article
          class="price-card
          ${
            item.id ===
            'CLUB50'
            ?
            'featured'
            :
            ''
          }"
        >

          <small>
            ${esc(item.id || 'EAH')}
          </small>

          <h3>
            ${esc(item.name)}
          </h3>

          <div class="price">

            ${
              typeof item.price ===
              'number'
              ?
              item.price +
              ' €'
              :
              esc(item.price)
            }

          </div>

          <p>
            ${esc(item.description || '')}
          </p>

          ${
            item.id ===
            'VERIFIED'
            ?
            `
            <span class="badge verified">
              ✓ EAH VERIFIED
            </span>
            `
            :
            ''
          }

        </article>
        `
      )
      .join('');

}


/* =========================================================
   SPOTS
========================================================= */

function renderSpots() {

  const grid =
    document.getElementById(
      'spotsGrid'
    );


  if (
    !state.spots.length
  ) {

    grid.innerHTML =
      `
      <div class="notice">
        Aucun spot publié pour le moment.
      </div>
      `;

    return;

  }


  grid.innerHTML =
    state.spots
      .map(
        spot => {

          const photo =
            driveImage(
              spot.photoUrl
              ||
              spot.imageUrl
              ||
              ''
            );


          const heights =
            String(
              spot.heights ||
              ''
            )
            .split(
              /[,;]+/
            )
            .filter(
              Boolean
            )
            .map(
              height =>
              `
              <span>
                ${esc(height.trim())}
              </span>
              `
            )
            .join('');


          return `
          <article class="spot">

            <div class="spot-picture">

              ${
                photo
                ?
                `
                <img
                  src="${esc(photo)}"
                  alt="${esc(spot.name)}"
                >
                `
                :
                ''
              }

            </div>


            <div class="spot-content">

              <span class="overline">
                ${esc(
                  spot.city
                  ||
                  spot.country
                  ||
                  'SPOT EAH'
                )}
              </span>

              <h2>
                ${esc(spot.name)}
              </h2>


              <div class="tags">

                ${heights}

                ${
                  spot.type
                  ?
                  `
                  <span>
                    ${esc(spot.type)}
                  </span>
                  `
                  :
                  ''
                }

              </div>


              ${
                spot.address
                ?
                `
                <p>
                  ${esc(spot.address)}
                </p>
                `
                :
                ''
              }


              <p>
                ${esc(spot.description || '')}
              </p>


              ${
                spot.warning
                ?
                `
                <div class="warning">
                  ${esc(spot.warning)}
                </div>
                `
                :
                ''
              }


              ${
                spot.mapUrl
                ?
                `
                <a
                  class="button small secondary"
                  href="${esc(spot.mapUrl)}"
                  target="_blank"
                  rel="noopener"
                >
                  Voir la carte
                </a>
                `
                :
                ''
              }

            </div>

          </article>
          `;

        }
      )
      .join('');

}


function renderSpotSelect() {

  document
    .getElementById(
      'spotId'
    )
    .innerHTML =
    `
    <option value="">
      Autre / non répertorié
    </option>
    `
    +
    state.spots
      .map(
        spot =>
        `
        <option value="${esc(spot.id)}">

          ${esc(spot.name)}

          —

          ${esc(spot.city || '')}

        </option>
        `
      )
      .join('');

}


function syncSpotName() {

  const id =
    val(
      'spotId'
    );


  const spot =
    state.spots
      .find(
        item =>
          String(item.id)
          ===
          String(id)
      );


  if (spot) {

    document
      .getElementById(
        'spotName'
      )
      .value =
      spot.name;

  }

}


/* =========================================================
   ACTUALITÉS
========================================================= */

function renderNews() {

  const featuredBox =
    document.getElementById(
      'newsFeatured'
    );


  const grid =
    document.getElementById(
      'newsGrid'
    );


  if (
    !state.news.length
  ) {

    featuredBox.innerHTML =
      '';


    grid.innerHTML =
      `
      <div class="notice">
        Aucune actualité publiée pour le moment.
      </div>
      `;

    return;

  }


  const featured =
    state.news
      .find(
        item =>
          truthy(
            item.featured
          )
      )
    ||
    state.news[
      0
    ];


  const others =
    state.news
      .filter(
        item =>
          item !==
          featured
      );


  const image =
    driveImage(
      featured.imageUrl ||
      ''
    );


  featuredBox.innerHTML =
  `
  <article class="news-featured">

    ${
      image
      ?
      `
      <img
        src="${esc(image)}"
        alt="${esc(featured.title)}"
      >
      `
      :
      ''
    }


    <div class="news-body">

      <div class="news-meta">

        ${esc(featured.category || 'EAH DIVING')}

        •

        ${esc(fmtDate(featured.date))}

      </div>


      <h2>
        ${esc(featured.title)}
      </h2>


      <p>
        ${esc(
          featured.summary
          ||
          featured.content
          ||
          ''
        )}
      </p>


      <button
        class="button small"
        type="button"
        onclick="openNews('${esc(String(featured.id))}')"
      >
        Lire
      </button>

    </div>

  </article>
  `;


  grid.innerHTML =
    others
      .map(
        news => {

          const newsImage =
            driveImage(
              news.imageUrl ||
              ''
            );


          return `
          <article class="news-card">

            ${
              newsImage
              ?
              `
              <img
                src="${esc(newsImage)}"
                alt="${esc(news.title)}"
              >
              `
              :
              ''
            }


            <div class="news-meta">

              ${esc(news.category || 'EAH')}

              •

              ${esc(fmtDate(news.date))}

            </div>


            <h3>
              ${esc(news.title)}
            </h3>


            <p>
              ${esc(news.summary || '')}
            </p>


            <button
              class="button small secondary"
              type="button"
              onclick="openNews('${esc(String(news.id))}')"
            >
              Lire
            </button>

          </article>
          `;

        }
      )
      .join('');

}


function openNews(
  id
) {

  const news =
    state.news
      .find(
        item =>
          String(item.id)
          ===
          String(id)
      );


  if (!news) {
    return;
  }


  const image =
    driveImage(
      news.imageUrl ||
      ''
    );


  openModal(
    `
    <div class="modal-inner">

      <span class="overline">
        ${esc(news.category || 'ACTUALITÉ EAH')}
      </span>

      <h2>
        ${esc(news.title)}
      </h2>

      <p>
        ${esc(fmtDate(news.date))}
      </p>

      ${
        image
        ?
        `
        <img
          class="modal-image"
          src="${esc(image)}"
          alt="${esc(news.title)}"
        >
        `
        :
        ''
      }


      <p>

        ${
          esc(
            news.content
            ||
            news.summary
            ||
            ''
          )
          .replace(
            /\n/g,
            '<br>'
          )
        }

      </p>


      ${
        news.videoUrl
        ?
        `
        <p>

          <a
            class="button small"
            href="${esc(news.videoUrl)}"
            target="_blank"
            rel="noopener"
          >
            Voir la vidéo
          </a>

        </p>
        `
        :
        ''
      }


      ${
        news.linkUrl
        ?
        `
        <p>

          <a
            class="button small secondary"
            href="${esc(news.linkUrl)}"
            target="_blank"
            rel="noopener"
          >
            Ouvrir le lien
          </a>

        </p>
        `
        :
        ''
      }

    </div>
    `
  );

}


/* =========================================================
   CONNEXION COACH
========================================================= */

async function coachLogin() {

  const msg =
    document.getElementById(
      'loginMsg'
    );


  if (!CLUB) {

    msg.innerHTML =
      `
      <div class="notice error">
        Ouvre d’abord un club.
      </div>
      `;

    return;

  }


  msg.innerHTML =
    `
    <div class="notice">
      Connexion…
    </div>
    `;


  try {

    const result =
      await postIframe({

        action:
          'coachLogin',

        club:
          CLUB,

        email:
          val(
            'coachEmail'
          ),

        pin:
          val(
            'coachPin'
          )

      });


    if (
      !result.ok
    ) {

      throw new Error(
        result.error ||
        'Connexion refusée'
      );

    }


    state.session =
      result.session;


    state.coach =
      result.coach;


    document
      .getElementById(
        'loginBox'
      )
      .classList
      .add(
        'hidden'
      );


    document
      .getElementById(
        'clubPrivate'
      )
      .classList
      .remove(
        'hidden'
      );


    document
      .getElementById(
        'evaluationLocked'
      )
      .classList
      .add(
        'hidden'
      );


    document
      .getElementById(
        'evaluationForm'
      )
      .classList
      .remove(
        'hidden'
      );


    document
      .getElementById(
        'coachBadge'
      )
      .textContent =
      result.coach.name
      +
      ' • '
      +
      result.coach.role;


    await loadCoachData();

  } catch(error) {

    msg.innerHTML =
      `
      <div class="notice error">
        ${esc(error.message)}
      </div>
      `;

  }

}


/* =========================================================
   DONNÉES COACH
========================================================= */

async function loadCoachData() {

  const [
    divers,
    dashboard
  ] =
  await Promise.all([

    getJSON(
      'sessionDivers',
      {
        club:
          CLUB,

        session:
          state.session
      }
    ),


    getJSON(
      'dashboard',
      {
        club:
          CLUB,

        session:
          state.session
      }
    )

  ]);


  if (
    divers.ok
  ) {

    state.divers =
      divers.items;


    document
      .getElementById(
        'eahId'
      )
      .innerHTML =
      divers.items
        .map(
          diver =>
          `
          <option value="${esc(diver.id)}">

            ${esc(diver.name)}

            —

            ${esc(diver.group || '')}

          </option>
          `
        )
        .join('');

  }


  if (
    dashboard.ok
  ) {

    renderDashboard(
      dashboard
    );

  }

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard(
  dashboard
) {

  const stats =
    dashboard.stats ||
    {};


  document
    .getElementById(
      'dashboardStats'
    )
    .innerHTML =
    [

      [
        'Plongeurs',
        stats.divers ?? 0
      ],

      [
        'Grade Reports',
        stats.evaluations ?? 0
      ],

      [
        'EAH Verified',
        stats.verified ?? 0
      ],

      [
        'Blazons obtenus',
        stats.blazons ?? 0
      ]

    ]
    .map(
      item =>
      `
      <div>

        <strong>
          ${esc(item[1])}
        </strong>

        <span>
          ${esc(item[0])}
        </span>

      </div>
      `
    )
    .join('');


  document
    .getElementById(
      'recentDashboard'
    )
    .innerHTML =
    (
      dashboard.recent ||
      []
    )
    .map(
      item =>
      `
      <div class="history-item">

        <span>

          <strong>
            ${esc(item.code)}
          </strong>

          •

          ${fmtDate(item.date)}

          ${
            item.verified
            ?
            `
            <span class="badge verified">
              EAH VERIFIED
            </span>
            `
            :
            ''
          }

        </span>


        <span>
          ${esc(item.eah)}/10
        </span>

      </div>
      `
    )
    .join('')
    ||
    'Aucune évaluation.';


  document
    .getElementById(
      'groupsDashboard'
    )
    .innerHTML =
    Object
      .entries(
        dashboard.groups ||
        {}
      )
      .map(
        ([group,value]) =>
        `
        <div class="history-item">

          <span>

            <strong>
              ${esc(group)}
            </strong>

          </span>


          <span>

            ${esc(value.divers)}
            plongeur(s)

            •

            ${esc(value.evaluations)}
            évaluation(s)

          </span>

        </div>
        `
      )
      .join('')
    ||
    'Aucun groupe.';

}


/* =========================================================
   ENVOI ÉVALUATION
========================================================= */

async function submitEvaluation(
  event
) {

  event.preventDefault();


  const button =
    document.getElementById(
      'submitEvalBtn'
    );


  const msg =
    document.getElementById(
      'evaluationMsg'
    );


  button.disabled =
    true;


  button.textContent =
    'Génération en cours…';


  msg.innerHTML =
    '';


  try {

    let videoBase64 =
      '';


    let videoName =
      '';


    let videoMime =
      '';


    const file =
      document
        .getElementById(
          'videoFile'
        )
        .files[0];


    if (file) {

      if (
        file.size >
        20 *
        1024 *
        1024
      ) {

        throw new Error(
          'La vidéo dépasse 20 Mo. Utilise le champ URL.'
        );

      }


      videoBase64 =
        await fileToDataUrl(
          file
        );


      videoName =
        file.name;


      videoMime =
        file.type ||
        'video/mp4';

    }


    const data = {

      action:
        'submitEvaluation',

      club:
        CLUB,

      session:
        state.session,

      eahId:
        val(
          'eahId'
        ),

      discipline:
        val(
          'discipline'
        ),

      diveCode:
        val(
          'diveCode'
        ),

      diveName:
        val(
          'diveName'
        ),

      height:
        val(
          'height'
        ),

      spotId:
        val(
          'spotId'
        ),

      spotName:
        val(
          'spotName'
        ),

      waScore:
        val(
          'waScore'
        ),

      dd:
        val(
          'dd'
        ),

      eahDifficulty:
        val(
          'eahDifficulty'
        ),

      positive:
        val(
          'positive'
        ),

      improve:
        val(
          'improve'
        ),

      comment:
        val(
          'comment'
        ),

      videoUrl:
        val(
          'videoUrl'
        ),

      videoBase64,

      videoName,

      videoMime,

      videoQrAccessible:
        document
          .getElementById(
            'videoQrAccessible'
          )
          .checked

    };


    [
      'D',
      'T',
      'E'
    ]
    .forEach(
      prefix => {

        for (
          let index = 1;
          index <= 5;
          index++
        ) {

          data[
            prefix +
            index
          ] =
          val(
            prefix +
            index
          );

        }

      }
    );


    const result =
      await postIframe(
        data
      );


    if (
      !result.ok
    ) {

      throw new Error(
        result.error ||
        'Erreur'
      );

    }


    msg.innerHTML =
      `
      <div class="notice success">

        <strong>
          Grade Report généré.
        </strong>

        <br>

        Takeoff
        ${esc(result.takeoff)}/10

        •

        Trick
        ${esc(result.trick)}/10

        •

        Entry
        ${esc(result.entry)}/10

        •

        <strong>
          EAH
          ${esc(result.eahScore)}/10
        </strong>

        <br>

        <a
          class="button small"
          href="${esc(result.reportUrl)}"
          target="_blank"
        >
          Ouvrir le PDF
        </a>

      </div>
      `;


    document
      .getElementById(
        'videoFile'
      )
      .value =
      '';


    await loadCoachData();

  } catch(error) {

    msg.innerHTML =
      `
      <div class="notice error">
        ${esc(error.message)}
      </div>
      `;

  } finally {

    button.disabled =
      false;


    button.textContent =
      'Générer le Grade Report';

  }

}


/* =========================================================
   FICHIER VIDEO
========================================================= */

function fileToDataUrl(
  file
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();


      reader.onload =
        () =>
          resolve(
            reader.result
          );


      reader.onerror =
        reject;


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =========================================================
   PROFIL PLONGEUR
========================================================= */

async function loadProfileManual() {

  const id =
    val(
      'profileId'
    )
    .trim();


  const token =
    val(
      'profileToken'
    )
    .trim();


  const view =
    document.getElementById(
      'profileView'
    );


  if (!id) {
    return;
  }


  view.classList.remove(
    'hidden'
  );


  if (!CLUB) {

    view.innerHTML =
      `
      <div class="notice error">

        Le lien du profil doit contenir :

        ?club=nom-du-club

      </div>
      `;

    return;

  }


  view.innerHTML =
    `
    <div class="notice">
      Chargement…
    </div>
    `;


  try {

    const result =
      await getJSON(
        'profile',
        {
          club:
            CLUB,

          id,

          token
        }
      );


    if (
      !result.ok
    ) {

      throw new Error(
        result.error
      );

    }


    renderProfile(
      result.profile
    );

  } catch(error) {

    view.innerHTML =
      `
      <div class="notice error">
        ${esc(error.message)}
      </div>
      `;

  }

}


function renderProfile(
  profile
) {

  document
    .getElementById(
      'profileEmpty'
    )
    .classList
    .add(
      'hidden'
    );


  const history =
    profile.evaluations ||
    [];


  document
    .getElementById(
      'profileView'
    )
    .innerHTML =
  `
  <div class="profile-card">

    <div class="profile-head">

      ${
        profile.photoUrl
        ?
        `
        <img
          class="avatar"
          src="${esc(driveImage(profile.photoUrl))}"
          alt=""
        >
        `
        :
        `
        <div class="avatar">
        </div>
        `
      }


      <div>

        <span class="badge">
          ${esc(profile.eahId)}
        </span>

        <h2>
          ${esc(profile.firstName)}
          ${esc(profile.lastName)}
        </h2>

        <p>
          ${esc(profile.club)}
          •
          ${esc(profile.group || '')}
        </p>

        <p>

          <strong>
            Blazon actuel :
          </strong>

          ${esc(
            profile.currentBlazon ||
            'En progression'
          )}

        </p>

      </div>

    </div>

  </div>


  <div class="examples-grid">

    <article class="example-panel">

      <span class="overline">
        PROGRESSION
      </span>

      <h3>
        Blazons
      </h3>

      ${
        (
          profile.blazons ||
          []
        )
        .map(
          blazon =>
          `
          <div class="history-item">

            <span>
              ${esc(blazon.name)}
            </span>

            <span>

              ${
                blazon.status ===
                'OBTENU'
                ?
                `
                <span class="badge">
                  OBTENU
                </span>
                `
                :
                esc(blazon.progress)
                +
                ' %'
              }

            </span>

          </div>
          `
        )
        .join('')
        ||
        'Aucune progression.'
      }

    </article>


    <article class="example-panel">

      <span class="overline">
        HISTORIQUE
      </span>

      <h3>
        Grade Reports
      </h3>

      ${
        history
        .map(
          item =>
          `
          <div class="history-item">

            <span>

              <strong>
                ${esc(item.code)}
              </strong>

              —

              ${esc(item.height)}
              m

              <br>

              <small>

                ${fmtDate(item.date)}

                •

                ${esc(item.spot || '')}

              </small>

            </span>


            <span>

              <strong>
                EAH
                ${esc(item.eah)}/10
              </strong>

              ${
                item.verified
                ?
                `
                <br>

                <span class="badge verified">
                  EAH VERIFIED
                </span>
                `
                :
                ''
              }

              ${
                item.reportUrl
                ?
                `
                <br>

                <a
                  href="${esc(item.reportUrl)}"
                  target="_blank"
                >
                  PDF
                </a>
                `
                :
                ''
              }

            </span>

          </div>
          `
        )
        .join('')
        ||
        'Aucune évaluation.'
      }

    </article>

  </div>
  `;

}


/* =========================================================
   POPULATION
========================================================= */

async function loadPopulation() {

  const code =
    val(
      'populationCode'
    )
    .trim()
    .toUpperCase();


  const box =
    document.getElementById(
      'populationResults'
    );


  if (!code) {

    box.innerHTML =
      `
      <div class="notice">
        Entre un code de plongeon.
      </div>
      `;

    return;

  }


  if (!CLUB) {

    box.innerHTML =
      `
      <div class="notice">

        Pour le moment,
        ouvre un club pour consulter la Population.

      </div>
      `;

    return;

  }


  box.innerHTML =
    `
    <div class="notice">
      Chargement…
    </div>
    `;


  try {

    const result =
      await getJSON(
        'population',
        {
          club:
            CLUB,

          code
        }
      );


    if (
      !result.ok
    ) {

      throw new Error(
        result.error
      );

    }


    box.innerHTML =
    `
    <div class="metrics dashboard-metrics">

      <div>

        <strong>
          ${esc(result.club.people)}
        </strong>

        <span>
          plongeurs du club
        </span>

      </div>


      <div>

        <strong>
          ${esc(result.global.people)}
        </strong>

        <span>
          plongeurs EAH
        </span>

      </div>


      <div>

        <strong>
          ${esc(result.global.avgEah ?? '—')}
        </strong>

        <span>
          moyenne EAH
        </span>

      </div>


      <div>

        <strong>
          ${esc(result.global.avgWa ?? '—')}
        </strong>

        <span>
          moyenne WA
        </span>

      </div>

    </div>
    `;

  } catch(error) {

    box.innerHTML =
      `
      <div class="notice error">
        ${esc(error.message)}
      </div>
      `;

  }

}


/* =========================================================
   FORMULAIRE PUBLIC
========================================================= */

document
  .getElementById(
    'publicGradingForm'
  )
  ?.addEventListener(
    'submit',
    async event => {

      event.preventDefault();


      const msg =
        document.getElementById(
          'publicFormMessage'
        );


      msg.innerHTML =
        `
        <div class="notice">
          Envoi…
        </div>
        `;


      try {

        const result =
          await postIframe({

            action:
              'publicGradingRequest',

            firstName:
              val(
                'publicFirstName'
              ),

            lastName:
              val(
                'publicLastName'
              ),

            email:
              val(
                'publicEmail'
              ),

            discipline:
              val(
                'publicDiscipline'
              ),

            dive:
              val(
                'publicDive'
              ),

            height:
              val(
                'publicHeight'
              ),

            heightType:
              val(
                'publicHeightType'
              ),

            videoUrl:
              val(
                'publicVideo'
              ),

            message:
              val(
                'publicMessage'
              )

          });


        if (
          !result.ok
        ) {

          throw new Error(
            result.error ||
            'Erreur'
          );

        }


        msg.innerHTML =
          `
          <div class="notice success">

            <strong>
              Demande enregistrée.
            </strong>

            ${
              result.requestId
              ?
              `
              <br>
              Référence :
              ${esc(result.requestId)}
              `
              :
              ''
            }

          </div>
          `;


        event.target.reset();

      } catch(error) {

        msg.innerHTML =
          `
          <div class="notice error">
            ${esc(error.message)}
          </div>
          `;

      }

    }
  );


/* =========================================================
   LANCEMENT
========================================================= */

init();
