/* =========================================================
   EAH DIVING CLUB V3
========================================================= */


/* =========================================================
   API APPS SCRIPT
========================================================= */

const API_URL =
'https://script.google.com/macros/s/AKfycbxW7Va1ry6Qvg_HTcmsbH5lUkpZvtcuf3pFhEynZo2yh3X3anl1igsVw-3buY0l-Hjj0A/exec';


/* =========================================================
   PARAMETRES URL
========================================================= */

const params =
  new URLSearchParams(
    window.location.search
  );


let CLUB =
  (
    params.get('club')
    ||
    ''
  )
  .trim();


const COACH_TOKEN =
  (
    params.get('coachToken')
    ||
    ''
  )
  .trim();


/* =========================================================
   ETAT
========================================================= */

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
   CRITERES EAH
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

  BLANC: "blazon-blanc.png",
  ORANGE: "blazon-orange.png",
  VERT: "blazon-vert.png",
  BLEU: "blazon-bleu.png",
  ROUGE: "blazon-rouge.png",
  BRONZE: "blazon-bronze.png",
  ARGENT: "blazon-argent.png",
  OR: "blazon-or.png",
  NOIR: "blazon-noir.png",
  LEGEND: "blazon-legend.png",
  LEGENDE: "blazon-legend.png",
  TITAN: "blazon-titan.png"

};


/* =========================================================
   NAVIGATION
========================================================= */

const pages =
  document.querySelectorAll(
    '.page'
  );


const navigationLinks =
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
  pageName
) {

  pages.forEach(
    page => {

      page.classList.toggle(
        'active',
        page.id === pageName
      );

    }
  );


  if (
    window.location.hash !==
    '#' + pageName
  ) {

    history.replaceState(
      null,
      '',
      window.location.pathname
      +
      window.location.search
      +
      '#'
      +
      pageName
    );

  }


  window.scrollTo({

    top:0,

    behavior:'smooth'

  });


  if (navigation) {

    navigation.classList.remove(
      'open'
    );

  }

}


navigationLinks.forEach(
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
        () => {

          showPage(
            card.dataset.open
          );

        }
      );

    }
  );


if (mobileMenu) {

  mobileMenu.addEventListener(
    'click',
    () => {

      navigation.classList.toggle(
        'open'
      );

    }
  );

}


window.addEventListener(
  'hashchange',
  () => {

    const hash =
      location.hash
        .replace(
          '#',
          ''
        );


    if (
      hash &&
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

  if (
    !siteModal ||
    !modalContent
  ) {
    return;
  }


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

  if (!siteModal) {
    return;
  }


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
   FICHES GRADING
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
      "L'Entry analyse la phase terminale de la performance."

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


          if (!sheet) {
            return;
          }


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

                Chaque critère comporte cinq éléments.

                <br><br>

                2 = Validé<br>
                1 = Partiel<br>
                0 = Non validé<br>
                N/A = Non applicable

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
    character => ({

      '&':'&amp;',

      '<':'&lt;',

      '>':'&gt;',

      '"':'&quot;',

      "'":'&#39;'

    }[character])
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

  const element =
    document.getElementById(
      id
    );


  return element
    ?
    element.value
    :
    '';

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


  if (!match) {
    return source;
  }


  return (
    'https://drive.google.com/thumbnail?id='
    +
    match[1]
    +
    '&sz=w1600'
  );

}


function normalizeBlazonName(name) {

  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()

    /* transforme "Blazon Blanc" en "BLANC" */
    .replace(/^BLAZON\s+/, "")

    /* sécurité supplémentaire */
    .replace(/^LE\s+BLAZON\s+/, "");

}


function blazonImage(name, imageUrl = "") {

  const key =
    normalizeBlazonName(name);

  if (BLAZON_IMAGES[key]) {
    return BLAZON_IMAGES[key];
  }

  if (imageUrl) {
    return driveImage(imageUrl);
  }

  return "";
}


/* =========================================================
   IFRAME RETOUR
========================================================= */

window.addEventListener(
  'message',
  event => {

    const message =
      event.data ||
      {};


    if (
      !message.requestId
      ||
      !pendingPosts.has(
        message.requestId
      )
    ) {

      return;

    }


    const pending =
      pendingPosts.get(
        message.requestId
      );


    pendingPosts.delete(
      message.requestId
    );


    pending.resolve(
      message.data
    );

  }
);


/* =========================================================
   GET JSONP
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


      let finished =
        false;


      const cleanup =
        () => {

          if (finished) {
            return;
          }

          finished =
            true;


          try {

            delete window[
              callback
            ];

          } catch(e) {}


          try {

            script.remove();

          } catch(e) {}

        };


      window[
        callback
      ] =
        data => {

          resolve(
            data
          );


          cleanup();

        };


      const query =
        new URLSearchParams({

          action,

          callback,

          ...extra

        });


      script.src =
        API_URL
        +
        '?'
        +
        query.toString();


      script.onerror =
        () => {

          reject(
            new Error(
              'Impossible de joindre Apps Script.'
            )
          );


          cleanup();

        };


      document.body.appendChild(
        script
      );


      setTimeout(
        () => {

          if (!finished) {

            reject(
              new Error(
                'Apps Script ne répond pas.'
              )
            );


            cleanup();

          }

        },
        30000
      );

    }
  );

}


/* =========================================================
   POST IFRAME
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


      const payload = {

        ...data,

        transport:
          'iframe',

        requestId

      };


      Object
        .entries(
          payload
        )
        .forEach(
          ([key,value]) => {

            const field =
              document.createElement(
                'textarea'
              );


            field.name =
              key;


            field.value =
              value == null
              ?
              ''
              :
              String(
                value
              );


            form.appendChild(
              field
            );

          }
        );


      document.body.appendChild(
        form
      );


      form.submit();


      setTimeout(
        () => {

          form.remove();

        },
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
                'Délai dépassé lors de la communication avec Apps Script.'
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


  const baseRequests = [

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


  let clubPromise =
    Promise.resolve(
      {
        ok:false
      }
    );


  if (CLUB) {

    clubPromise =
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
      );

  }


  const [
    blazons,
    pricing,
    spots,
    news,
    club
  ] =
  await Promise.all([

    ...baseRequests,

    clubPromise

  ]);


  /* BLAZONS */

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


  /* TARIFS */

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


  /* SPOTS */

  state.spots =
    spots?.ok
    ?
    (
      spots.items ||
      []
    )
    .filter(
      item => {

        return (
          item.active === undefined
          ||
          item.active === ''
          ||
          truthy(
            item.active
          )
        );

      }
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


  /* ACTUALITES */

  state.news =
    news?.ok
    ?
    (
      news.items ||
      []
    )
    .filter(
      item => {

        return (
          item.active === undefined
          ||
          item.active === ''
          ||
          truthy(
            item.active
          )
        );

      }
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


  /* CLUB PRESENT DANS L'URL */

  if (
    CLUB &&
    club?.ok
  ) {

    state.club =
      club.club;


    renderClubIdentity(
      club.club
    );


    prefillClubNames(
      club.club.name
    );

  }


  /* CARTE PLONGEUR */

  const profileId =
    params.get(
      'id'
    );


  const profileToken =
    params.get(
      'token'
    );


  if (
    profileId &&
    profileToken
  ) {

    document
      .getElementById(
        'profileId'
      )
      .value =
      profileId;


    document
      .getElementById(
        'profileToken'
      )
      .value =
      profileToken;


    showPage(
      'profil'
    );


    await loadProfileManual();


    return;

  }


  /* CARTE NFC COACH */

  if (
    CLUB &&
    COACH_TOKEN
  ) {

    showPage(
      'club'
    );


    await autoCoachNfcLogin(
      COACH_TOKEN
    );


    return;

  }


  /* PAGE STANDARD */

  const hash =
    location.hash
      .replace(
        '#',
        ''
      );


  if (
    hash &&
    document.getElementById(
      hash
    )
  ) {

    showPage(
      hash
    );

  } else {

    showPage(
      'accueil'
    );

  }

}


/* =========================================================
   IDENTITE CLUB
========================================================= */

function renderClubIdentity(
  club
) {

  const box =
    document.getElementById(
      'clubIdentity'
    );


  if (!box) {
    return;
  }


  box.classList.remove(
    'hidden'
  );


  const logo =
    driveImage(
      club.logoUrl ||
      ''
    );


  box.innerHTML =
  `
  ${
    logo
    ?
    `
    <img
      src="${esc(logo)}"
      alt="${esc(club.name || 'Club')}"
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
        club.welcomeText
        ||
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


  const title =
    document.getElementById(
      'privateClubTitle'
    );


  if (title) {

    title.textContent =
      club.name ||
      'EAH Diving Club';

  }

}


function prefillClubNames(
  clubName
) {

  const coach =
    document.getElementById(
      'coachClubName'
    );


  const diver =
    document.getElementById(
      'diverClubName'
    );


  if (
    coach &&
    !coach.value
  ) {

    coach.value =
      clubName ||
      '';

  }


  if (
    diver &&
    !diver.value
  ) {

    diver.value =
      clubName ||
      '';

  }

}


/* =========================================================
   CRITERES
========================================================= */

function renderCriteria() {

  Object
    .entries(
      CRITERIA
    )
    .forEach(
      ([prefix,items]) => {

        const container =
          document.getElementById(
            'criteria' +
            prefix
          );


        if (!container) {
          return;
        }


        container.innerHTML =
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
   PLONGEONS
========================================================= */

function renderDiveList() {

  const list =
    document.getElementById(
      'diveCodes'
    );


  if (!list) {
    return;
  }


  list.innerHTML =
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
    .trim()
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
   BLAZONS
========================================================= */

function renderBlazons() {

  const grid =
    document.getElementById("blazonGrid");

  if (!grid) {
    return;
  }


  if (!state.blazons.length) {

    grid.innerHTML = `
      <div class="notice">
        Aucun blazon disponible.
      </div>
    `;

    return;
  }


  grid.innerHTML =
    state.blazons.map((blazon, index) => {

      const image =
        blazonImage(
          blazon.name,
          blazon.imageUrl || ""
        );


      return `
        <article
          class="blazon-card blazon-photo-card"
          onclick="openBlazon(${index})"
        >

          ${
            image
            ?
            `
            <img
              src="${esc(image)}"
              alt="${esc(blazon.name)}"
              onerror="
                console.error('Image blazon introuvable :', this.src);
                this.style.opacity='.25';
              "
            >
            `
            :
            `
            <div class="blazon-image-missing">
              Image manquante
            </div>
            `
          }

          <h3>
            ${esc(blazon.name)}
          </h3>

          <span class="blazon-open">
            Voir les critères →
          </span>

        </article>
      `;

    }).join("");

}


function openBlazon(
  index
) {

  const blazon =
    state.blazons[
      index
    ];


  if (!blazon) {
    return;
  }


  const rules =
    blazon.rules ||
    {};


  let html =
  `
  <div class="modal-inner">

    <span class="overline">
      RÉFÉRENTIEL EAH DIVING V2
    </span>

    <h2>
      ${esc(blazon.name)}
    </h2>
  `;


  if (
    rules.summary
  ) {

    html +=
      `
      <div class="modal-note">
        ${esc(rules.summary)}
      </div>
      `;

  }


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


  if (
    !allSeries.length
  ) {

    html +=
      `
      <div class="notice">
        Conditions non disponibles.
      </div>
      `;

  }


  allSeries.forEach(
    series => {

      const title =
        series.label
        ||
        (
          Number(
            series.height
          ) === 0
          ?
          'Bord / plot'
          :
          (
            series.height
            ?
            series.height + ' m'
            :
            'Série'
          )
        );


      html +=
      `
      <div class="blazon-detail">

        <h3>
          ${esc(title)}
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

          <strong>
            OU
          </strong>

          ${esc(series.minEah ?? '—')}/10
          EAH Diving

        </p>
        `;

      }


      if (
        Array.isArray(
          series.alternativeHeights
        )
        &&
        series.alternativeHeights.length
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
            <div class="blazon-code">

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

            </div>
            `;

          } else {

            html +=
            `
            <div class="blazon-code">

              <strong>
                ${esc(code)}
              </strong>

              —

              ${esc(DIVE_NAMES[code] || '')}

            </div>
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


  html +=
    `
    </div>
    `;


  openModal(
    html
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


  if (!grid) {
    return;
  }


  if (
    !state.pricing.length
  ) {

    grid.innerHTML =
      `
      <div class="notice">
        Les tarifs ne sont pas disponibles.
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
            String(
              item.id ||
              ''
            )
            .toUpperCase()
            .includes(
              '50'
            )
            ?
            'featured'
            :
            ''
          }"
        >

          <small>
            ${esc(item.id || 'EAH DIVING')}
          </small>

          <h3>
            ${esc(item.name || '')}
          </h3>


          <div class="price">

            ${
              typeof item.price ===
              'number'
              ?
              item.price + ' €'
              :
              esc(item.price || '')
            }

          </div>


          <p>
            ${esc(item.description || '')}
          </p>


          ${
            String(
              item.id ||
              ''
            )
            .toUpperCase()
            ===
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


  if (!grid) {
    return;
  }


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
            .map(
              value =>
                value.trim()
            )
            .filter(
              Boolean
            )
            .map(
              height =>
              `
              <span>
                ${esc(height)}
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
                  alt="${esc(spot.name || 'Spot')}"
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
                ${esc(spot.name || '')}
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
                  <strong>
                    ${esc(spot.address)}
                  </strong>
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
                  Voir le lieu
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

  const select =
    document.getElementById(
      'spotId'
    );


  if (!select) {
    return;
  }


  select.innerHTML =
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
        <option value="${esc(spot.id || '')}">

          ${esc(spot.name || '')}

          ${
            spot.city
            ?
            ' — ' + esc(spot.city)
            :
            ''
          }

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
          String(
            item.id
          )
          ===
          String(
            id
          )
      );


  if (spot) {

    document
      .getElementById(
        'spotName'
      )
      .value =
      spot.name ||
      '';

  }

}


/* =========================================================
   ACTUALITES
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
    !featuredBox ||
    !grid
  ) {
    return;
  }


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
    state.news.find(
      item =>
        truthy(
          item.featured
        )
    )
    ||
    state.news[0];


  const others =
    state.news.filter(
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
        alt="${esc(featured.title || '')}"
      >
      `
      :
      ''
    }


    <div class="news-body">

      <div class="news-meta">

        ${esc(featured.category || 'EAH DIVING')}

        ${
          featured.date
          ?
          ' • ' + esc(fmtDate(featured.date))
          :
          ''
        }

      </div>


      <h2>
        ${esc(featured.title || '')}
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
        onclick="openNews('${esc(String(featured.id || ''))}')"
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
                alt="${esc(news.title || '')}"
              >
              `
              :
              ''
            }


            <div class="news-meta">

              ${esc(news.category || 'EAH')}

              ${
                news.date
                ?
                ' • ' + esc(fmtDate(news.date))
                :
                ''
              }

            </div>


            <h3>
              ${esc(news.title || '')}
            </h3>


            <p>
              ${esc(news.summary || '')}
            </p>


            <button
              class="button small secondary"
              type="button"
              onclick="openNews('${esc(String(news.id || ''))}')"
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
    state.news.find(
      item =>
        String(
          item.id
        )
        ===
        String(
          id
        )
    );


  if (!news) {
    return;
  }


  const image =
    driveImage(
      news.imageUrl ||
      ''
    );


  const content =
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
    );


  openModal(
    `
    <div class="modal-inner">

      <span class="overline">
        ${esc(news.category || 'ACTUALITÉ EAH')}
      </span>

      <h2>
        ${esc(news.title || '')}
      </h2>

      ${
        news.date
        ?
        `
        <p>
          ${esc(fmtDate(news.date))}
        </p>
        `
        :
        ''
      }

      ${
        image
        ?
        `
        <img
          class="modal-image"
          src="${esc(image)}"
          alt="${esc(news.title || '')}"
        >
        `
        :
        ''
      }

      <p>
        ${content}
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
   CONNEXION COACH RAPIDE
========================================================= */

async function coachQuickLogin() {

  const clubName =
    val("coachClubName")
    .trim();


  const password =
    val("coachPassword")
    .trim();


  const msg =
    document.getElementById(
      "loginMsg"
    );


  if (!clubName || !password) {

    msg.innerHTML = `
      <div class="notice error">
        Indique le nom du club et le mot de passe.
      </div>
    `;

    return;
  }


  const button =
    document.querySelector(
      "#clubAccess .button.submit"
    );


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "Connexion…";

  }


  try {

    const result =
      await postIframe({

        action:
          "coachQuickLogin",

        clubName:
          clubName,

        password:
          password

      });


    if (!result || !result.ok) {

      throw new Error(
        result?.error ||
        "Connexion refusée."
      );

    }


    CLUB =
      result.club.slug;


    state.session =
      result.session;


    state.coach =
      result.coach;


    document
      .getElementById("clubAccess")
      ?.classList
      .add("hidden");


    document
      .getElementById("clubPrivate")
      ?.classList
      .remove("hidden");


    document
      .getElementById("evaluationLocked")
      ?.classList
      .add("hidden");


    document
      .getElementById("evaluationForm")
      ?.classList
      .remove("hidden");


    const coachText =
      (result.coach?.name || "Coach")
      +
      " • "
      +
      (result.coach?.role || "Coach");


    document.getElementById(
      "coachBadge"
    ).textContent =
      coachText;


    document.getElementById(
      "dashboardCoachBadge"
    ).textContent =
      coachText;


    /*
      Pas d'appel supplémentaire bloquant.
    */

    showPage("club");


    msg.innerHTML =
      "";


    updateClubUrl();


    /*
      Le dashboard charge ensuite.
    */

    loadCoachData()
      .catch(console.error);


  } catch(error) {

    msg.innerHTML = `
      <div class="notice error">
        ${esc(error.message)}
      </div>
    `;


  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "Se connecter";

    }

  }

}

/* =========================================================
   CARTE NFC COACH
========================================================= */

async function autoCoachNfcLogin(token) {

  if (!CLUB || !token) {
    return;
  }


  const msg =
    document.getElementById("loginMsg");


  /* On masque immédiatement le formulaire */
  const access =
    document.getElementById("clubAccess");


  if (access) {
    access.classList.add("hidden");
  }


  if (msg) {

    msg.innerHTML = `
      <div class="notice">
        ⚡ Connexion NFC…
      </div>
    `;

  }


  try {

    const result =
      await postIframe({

        action: "coachLogin",

        club: CLUB,

        email:
          "nfc+" +
          CLUB +
          "@eah.local",

        pin: token

      });


    if (!result || !result.ok) {

      throw new Error(
        result?.error ||
        "Carte NFC invalide."
      );

    }


    state.session =
      result.session;

    state.coach =
      result.coach;


    document
      .getElementById("clubPrivate")
      ?.classList
      .remove("hidden");


    document
      .getElementById("evaluationLocked")
      ?.classList
      .add("hidden");


    document
      .getElementById("evaluationForm")
      ?.classList
      .remove("hidden");


    const coachText =
      (result.coach?.name || "Coach")
      +
      " • "
      +
      (result.coach?.role || "Coach");


    const badge =
      document.getElementById("coachBadge");


    if (badge) {
      badge.textContent =
        coachText;
    }


    const dashboardBadge =
      document.getElementById(
        "dashboardCoachBadge"
      );


    if (dashboardBadge) {
      dashboardBadge.textContent =
        coachText;
    }


    /*
      On affiche immédiatement l'espace club.
      Les données du dashboard chargent ensuite.
    */

    showPage("club");


    if (msg) {
      msg.innerHTML = "";
    }


    /*
      Chargement secondaire :
      cela ne bloque plus l'ouverture de l'espace coach.
    */

    loadCoachData()
      .catch(
        error =>
          console.error(
            "Dashboard :",
            error
          )
      );


  } catch(error) {

    console.error(error);


    if (access) {
      access.classList.remove("hidden");
    }


    if (msg) {

      msg.innerHTML = `
        <div class="notice error">
          Carte NFC Coach invalide ou désactivée.
        </div>
      `;

    }

  }

}

/* =========================================================
   FINALISER CONNEXION COACH
========================================================= */

async function finaliserConnexionCoach_(
  result
) {

  state.session =
    result.session;


  state.coach =
    result.coach;


  const access =
    document.getElementById(
      'clubAccess'
    );


  const privateZone =
    document.getElementById(
      'clubPrivate'
    );


  const locked =
    document.getElementById(
      'evaluationLocked'
    );


  const form =
    document.getElementById(
      'evaluationForm'
    );


  if (access) {

    access.classList.add(
      'hidden'
    );

  }


  if (privateZone) {

    privateZone.classList.remove(
      'hidden'
    );

  }


  if (locked) {

    locked.classList.add(
      'hidden'
    );

  }


  if (form) {

    form.classList.remove(
      'hidden'
    );

  }


  const badge =
    document.getElementById(
      'coachBadge'
    );


  const dashboardBadge =
    document.getElementById(
      'dashboardCoachBadge'
    );


  const coachText =
    (
      result.coach?.name
      ||
      'Coach'
    )
    +
    ' • '
    +
    (
      result.coach?.role
      ||
      'Coach'
    );


  if (badge) {

    badge.textContent =
      coachText;

  }


  if (dashboardBadge) {

    dashboardBadge.textContent =
      coachText;

  }


  await loadCoachData();

}


/* =========================================================
   DECONNEXION
========================================================= */

function logoutCoach() {

  state.session =
    '';


  state.coach =
    null;


  state.divers =
    [];


  document
    .getElementById(
      'clubPrivate'
    )
    ?.classList
    .add(
      'hidden'
    );


  document
    .getElementById(
      'clubAccess'
    )
    ?.classList
    .remove(
      'hidden'
    );


  document
    .getElementById(
      'evaluationForm'
    )
    ?.classList
    .add(
      'hidden'
    );


  document
    .getElementById(
      'evaluationLocked'
    )
    ?.classList
    .remove(
      'hidden'
    );


  const password =
    document.getElementById(
      'coachPassword'
    );


  if (password) {

    password.value =
      '';

  }


  showPage(
    'club'
  );

}


/* =========================================================
   URL CLUB
========================================================= */

function updateClubUrl() {

  if (!CLUB) {
    return;
  }


  const url =
    new URL(
      window.location.href
    );


  url.searchParams.set(
    'club',
    CLUB
  );


  url.searchParams.delete(
    'coachToken'
  );


  url.hash =
    'club';


  history.replaceState(
    null,
    '',
    url.toString()
  );

}


/* =========================================================
   DONNEES COACH
========================================================= */

async function loadCoachData() {

  if (
    !CLUB ||
    !state.session
  ) {

    return;

  }


  const [
    diversResult,
    dashboardResult
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
    diversResult.ok
  ) {

    state.divers =
      (
        diversResult.items ||
        []
      )
      .filter(
        diver =>
          String(
            diver.name ||
            ''
          )
          .trim() !==
          ''
      );


    const select =
      document.getElementById(
        'eahId'
      );


    if (select) {

      select.innerHTML =
        state.divers.length
        ?
        state.divers
          .map(
            diver =>
            `
            <option value="${esc(diver.id)}">

              ${esc(diver.name)}

              ${
                diver.group
                ?
                ' — ' + esc(diver.group)
                :
                ''
              }

            </option>
            `
          )
          .join('')
        :
        `
        <option value="">
          Aucun plongeur attribué
        </option>
        `;

    }

  }


  if (
    dashboardResult.ok
  ) {

    renderDashboard(
      dashboardResult
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


  const statsBox =
    document.getElementById(
      'dashboardStats'
    );


  if (statsBox) {

    statsBox.innerHTML =
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

  }


  const recent =
    document.getElementById(
      'recentDashboard'
    );


  if (recent) {

    recent.innerHTML =
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
              ${esc(item.code || '')}
            </strong>

            ${
              item.date
              ?
              ' • ' + esc(fmtDate(item.date))
              :
              ''
            }

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

          </span>


          <span>

            ${
              item.eah !== undefined
              ?
              esc(item.eah) + '/10'
              :
              '—'
            }

          </span>

        </div>
        `
      )
      .join('')
      ||
      'Aucune évaluation.';

  }


  const groups =
    document.getElementById(
      'groupsDashboard'
    );


  if (groups) {

    groups.innerHTML =
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

              ${esc(value.divers ?? 0)}
              plongeur(s)

              •

              ${esc(value.evaluations ?? 0)}
              évaluation(s)

            </span>

          </div>
          `
        )
        .join('')
      ||
      'Aucun groupe.';

  }

}


/* =========================================================
   ACCES PLONGEUR ESPACE CLUB
========================================================= */

async function diverLoginFromClub() {

  const clubName =
    val(
      'diverClubName'
    )
    .trim();


  const eahId =
    val(
      'diverEahId'
    )
    .trim();


  const token =
    val(
      'diverToken'
    )
    .trim();


  if (
    !eahId ||
    !token
  ) {

    alert(
      'Numéro EAH et token obligatoires.'
    );

    return;

  }


  try {

    let slug =
      CLUB;


    if (
      clubName
    ) {

      const resolved =
        await getJSON(
          'resolveClub',
          {
            name:
              clubName
          }
        );


      if (
        !resolved.ok
      ) {

        throw new Error(
          resolved.error
          ||
          'Club introuvable.'
        );

      }


      slug =
        resolved.club.slug;

    }


    if (!slug) {

      throw new Error(
        'Indique le nom du club.'
      );

    }


    CLUB =
      slug;


    document
      .getElementById(
        'profileId'
      )
      .value =
      eahId;


    document
      .getElementById(
        'profileToken'
      )
      .value =
      token;


    const url =
      new URL(
        window.location.href
      );


    url.searchParams.set(
      'club',
      CLUB
    );


    url.searchParams.set(
      'id',
      eahId
    );


    url.searchParams.set(
      'token',
      token
    );


    url.searchParams.delete(
      'coachToken'
    );


    url.hash =
      'profil';


    history.replaceState(
      null,
      '',
      url.toString()
    );


    showPage(
      'profil'
    );


    await loadProfileManual();

  } catch(error) {

    alert(
      error.message
    );

  }

}


/* =========================================================
   PROFIL
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


  if (
    !id ||
    !token
  ) {

    return;

  }


  if (!CLUB) {

    if (view) {

      view.classList.remove(
        'hidden'
      );


      view.innerHTML =
        `
        <div class="notice error">
          Le club n'est pas renseigné.
        </div>
        `;

    }


    return;

  }


  if (view) {

    view.classList.remove(
      'hidden'
    );


    view.innerHTML =
      `
      <div class="notice">
        Chargement du profil…
      </div>
      `;

  }


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
        ||
        'Profil introuvable.'
      );

    }


    renderProfile(
      result.profile
    );

  } catch(error) {

    if (view) {

      view.innerHTML =
        `
        <div class="notice error">
          ${esc(error.message)}
        </div>
        `;

    }

  }

}


function renderProfile(
  profile
) {

  const empty =
    document.getElementById(
      'profileEmpty'
    );


  const view =
    document.getElementById(
      'profileView'
    );


  if (empty) {

    empty.classList.add(
      'hidden'
    );

  }


  if (!view) {
    return;
  }


  const history =
    profile.evaluations ||
    [];


  const photo =
    driveImage(
      profile.photoUrl ||
      ''
    );


  view.innerHTML =
  `
  <div class="profile-card">

    <div class="profile-head">

      ${
        photo
        ?
        `
        <img
          class="avatar"
          src="${esc(photo)}"
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
          ${esc(profile.eahId || '')}
        </span>


        <h2>

          ${esc(profile.firstName || '')}

          ${esc(profile.lastName || '')}

        </h2>


        <p>

          ${esc(profile.club || '')}

          ${
            profile.group
            ?
            ' • ' + esc(profile.group)
            :
            ''
          }

        </p>


        <p>

          <strong>
            Blazon actuel :
          </strong>

          ${esc(
            profile.currentBlazon
            ||
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
              ${esc(blazon.name || '')}
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
                (
                  blazon.progress !==
                  undefined
                  ?
                  esc(blazon.progress)
                  +
                  ' %'
                  :
                  '—'
                )
              }

            </span>

          </div>
          `
        )
        .join('')
        ||
        'Aucune progression enregistrée.'
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
                ${esc(item.code || '')}
              </strong>

              ${
                item.height
                ?
                ' — ' + esc(item.height) + ' m'
                :
                ''
              }

              <br>

              <small>

                ${esc(fmtDate(item.date))}

                ${
                  item.spot
                  ?
                  ' • ' + esc(item.spot)
                  :
                  ''
                }

              </small>

            </span>


            <span>

              <strong>

                EAH

                ${esc(item.eah ?? '—')}/10

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
                  rel="noopener"
                >
                  Ouvrir PDF
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


  if (!box) {
    return;
  }


  if (!code) {

    box.innerHTML =
      `
      <div class="notice">
        Entre un code de plongeon.
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
            CLUB || '',

          code
        }
      );


    if (
      !result.ok
    ) {

      throw new Error(
        result.error
        ||
        'Données indisponibles.'
      );

    }


    const global =
      result.global ||
      {};


    const club =
      result.club ||
      {};


    box.innerHTML =
    `
    <div class="metrics dashboard-metrics">

      ${
        result.club
        ?
        `
        <div>

          <strong>
            ${esc(club.people ?? 0)}
          </strong>

          <span>
            plongeurs du club
          </span>

        </div>
        `
        :
        ''
      }


      <div>

        <strong>
          ${esc(global.people ?? 0)}
        </strong>

        <span>
          plongeurs EAH
        </span>

      </div>


      <div>

        <strong>
          ${esc(global.avgEah ?? '—')}
        </strong>

        <span>
          moyenne EAH
        </span>

      </div>


      <div>

        <strong>
          ${esc(global.avgWa ?? '—')}
        </strong>

        <span>
          moyenne World Aquatics
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
   EVALUATION COACH
========================================================= */

async function submitEvaluation(
  event
) {

  event.preventDefault();


  if (
    !state.session
  ) {

    alert(
      'Connexion coach requise.'
    );

    return;

  }


  const button =
    document.getElementById(
      'submitEvalBtn'
    );


  const message =
    document.getElementById(
      'evaluationMsg'
    );


  button.disabled =
    true;


  button.textContent =
    'Génération en cours…';


  message.innerHTML =
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
          'La vidéo dépasse 20 Mo. Utilise une URL.'
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
      !result ||
      !result.ok
    ) {

      throw new Error(
        result?.error
        ||
        'Erreur lors de la création du Grade Report.'
      );

    }


    message.innerHTML =
      `
      <div class="notice success">

        <strong>
          Grade Report généré.
        </strong>

        <br><br>

        Takeoff :
        ${esc(result.takeoff)}/10

        <br>

        Trick :
        ${esc(result.trick)}/10

        <br>

        Entry :
        ${esc(result.entry)}/10

        <br><br>

        <strong>
          Note EAH :
          ${esc(result.eahScore)}/10
        </strong>

        ${
          result.reportUrl
          ?
          `
          <br><br>

          <a
            class="button small"
            href="${esc(result.reportUrl)}"
            target="_blank"
            rel="noopener"
          >
            Ouvrir le Grade Report
          </a>
          `
          :
          ''
        }

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

    message.innerHTML =
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
   VIDEO
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
        () => {

          resolve(
            reader.result
          );

        };


      reader.onerror =
        reject;


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =========================================================
   FORMULAIRE PUBLIC
========================================================= */

const publicGradingForm =
  document.getElementById(
    'publicGradingForm'
  );


if (publicGradingForm) {

  publicGradingForm.addEventListener(
    'submit',
    async event => {

      event.preventDefault();


      const message =
        document.getElementById(
          'publicFormMessage'
        );


      message.innerHTML =
        `
        <div class="notice">
          Envoi de la demande…
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
          !result ||
          !result.ok
        ) {

          throw new Error(
            result?.error
            ||
            'Impossible d’enregistrer la demande.'
          );

        }


        message.innerHTML =
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

        message.innerHTML =
          `
          <div class="notice error">
            ${esc(error.message)}
          </div>
          `;

      }

    }
  );

}


/* =========================================================
   LANCEMENT
========================================================= */

init();
