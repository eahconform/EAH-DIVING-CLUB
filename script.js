/* ============================================================
   EAH DIVING
   FRONT-END OPTIMISE
============================================================ */


/* ============================================================
   CONFIGURATION
============================================================ */

const API_URL =
  "https://script.google.com/macros/s/AKfycbxW7Va1ry6Qvg_HTcmsbH5lUkpZvtcuf3pFhEynZo2yh3X3anl1igsVw-3buY0l-Hjj0A/exec";


const BOOTSTRAP_CACHE_KEY =
  "EAH_PUBLIC_BOOTSTRAP";


const BOOTSTRAP_CACHE_TTL =
  15 * 60 * 1000;


const params =
  new URLSearchParams(
    window.location.search
  );


let CLUB =
  String(
    params.get("club") || ""
  ).trim();


let CARD_ID =
  String(
    params.get("id") || ""
  ).trim();


let CARD_TOKEN =
  String(
    params.get("token") || ""
  ).trim();


let COACH_NFC_TOKEN =
  String(
    params.get("coachToken") || ""
  ).trim();



/* ============================================================
   ETAT GLOBAL
============================================================ */

const state = {

  blazons: [],

  pricing: [],

  spots: [],

  actualites: [],

  bootstrapLoaded: false,

  bootstrapPromise: null,

  coachSession: "",

  coach: null,

  divers: [],

  diverAuth: null,

  profile: null,

  profileHistory: null

};


const pendingPosts =
  new Map();



/* ============================================================
   DONNEES IMMEDIATES
   permettent d'afficher la page sans attendre Apps Script
============================================================ */

const BLAZON_FALLBACK = [

  {
    key: "BLANC",
    name: "Blazon Blanc"
  },

  {
    key: "ORANGE",
    name: "Blazon Orange"
  },

  {
    key: "VERT",
    name: "Blazon Vert"
  },

  {
    key: "BLEU",
    name: "Blazon Bleu"
  },

  {
    key: "ROUGE",
    name: "Blazon Rouge"
  },

  {
    key: "BRONZE",
    name: "Blazon Bronze"
  },

  {
    key: "ARGENT",
    name: "Blazon Argent"
  },

  {
    key: "OR",
    name: "Blazon Or"
  },

  {
    key: "NOIR",
    name: "Blazon Noir"
  },

  {
    key: "LEGEND",
    name: "Blazon Legend"
  },

  {
    key: "TITAN",
    name: "Blazon Titan"
  }

];


const PRICING_FALLBACK = [

  {
    id: "START",
    name: "Club Start",
    price: 590,
    renewal: 190,
    description:
      "25 profils + 25 cartes NFC/QR + espace club + Grade Reports."
  },

  {
    id: "CLUB50",
    name: "Club 50",
    price: 790,
    renewal: 290,
    description:
      "50 profils + 50 cartes NFC/QR + espace club et dashboard."
  },

  {
    id: "CLUB100",
    name: "Club 100",
    price: 990,
    renewal: 390,
    description:
      "100 profils + 100 cartes NFC/QR + espace club et dashboard."
  },

  {
    id: "VERIFIED",
    name: "EAH Verified",
    price: "9 €/vidéo",
    renewal: "—",
    description:
      "Vérification d'une vidéo directement par EAH Diving."
  },

  {
    id: "INDIVIDUAL",
    name: "Particulier",
    price: 50,
    renewal: "—",
    description:
      "Création du profil EAH + carte/QR + 3 gradations."
  }

];


const BLAZON_IMAGES = {

  BLANC:
    "blazon-blanc.png",

  ORANGE:
    "blazon-orange.png",

  VERT:
    "blazon-vert.png",

  BLEU:
    "blazon-bleu.png",

  ROUGE:
    "blazon-rouge.png",

  BRONZE:
    "blazon-bronze.png",

  ARGENT:
    "blazon-argent.png",

  OR:
    "blazon-or.png",

  NOIR:
    "blazon-noir.png",

  LEGEND:
    "blazon-legend.png",

  LEGENDE:
    "blazon-legend.png",

  TITAN:
    "blazon-titan.png"

};



/* ============================================================
   CRITERES EAH
============================================================ */

const CRITERIA = {

  D: [

    "Coordination / élan (si applicable)",

    "Impulsion / détente / élévation",

    "Trajectoire verticale",

    "Temps de fixation",

    "Amplitude des bras"

  ],


  T: [

    "Vitesse des rotations",

    "Saltos et/ou vrilles contrôlés",

    "Ligne / tenue / position du corps",

    "Ouverture (si applicable)",

    "Continuité / rythme"

  ],


  E: [

    "Angle vertical (si applicable)",

    "Éclaboussures / tolérance discipline",

    "Position des bras",

    "Jambes tendues et serrées",

    "Axe d'entrée"

  ]

};



/* ============================================================
   PLONGEONS
============================================================ */

const DIVE_NAMES = {

  "001A": "Chute avant droite",

  "001B": "Chute avant carpée",

  "001C": "Chute avant groupée",

  "002A": "Chute arrière droite",

  "002AS": "Plongeon arrière droit en sautant",

  "100A": "Chandelle avant droite",

  "101C": "Plongeon avant groupé",

  "102C": "1 salto avant groupé",

  "103C": "1½ salto avant groupé",

  "104C": "2 saltos avant groupés",

  "105C": "2½ saltos avant groupés",

  "105B": "2½ saltos avant carpés",

  "107C": "3½ saltos avant groupés",

  "107B": "3½ saltos avant carpés",

  "109C": "4½ saltos avant groupés",

  "109B": "4½ saltos avant carpés",

  "1011C": "5½ saltos avant groupés",

  "201C": "Plongeon arrière groupé",

  "201B": "Plongeon arrière carpé",

  "202C": "1 salto arrière groupé",

  "203C": "1½ salto arrière groupé",

  "203B": "1½ salto arrière carpé",

  "204C": "2 saltos arrière groupés",

  "205C": "2½ saltos arrière groupés",

  "205B": "2½ saltos arrière carpés",

  "207C": "3½ saltos arrière groupés",

  "207B": "3½ saltos arrière carpés",

  "209C": "4½ saltos arrière groupés",

  "301C": "Plongeon renversé groupé",

  "301B": "Plongeon renversé carpé",

  "302C": "1 salto renversé groupé",

  "303C": "1½ salto renversé groupé",

  "303B": "1½ salto renversé carpé",

  "304C": "2 saltos renversés groupés",

  "305C": "2½ saltos renversés groupés",

  "305B": "2½ saltos renversés carpés",

  "307C": "3½ saltos renversés groupés",

  "307B": "3½ saltos renversés carpés",

  "309C": "4½ saltos renversés groupés",

  "401C": "Plongeon retourné groupé",

  "402C": "1 salto retourné groupé",

  "403C": "1½ salto retourné groupé",

  "403B": "1½ salto retourné carpé",

  "404C": "2 saltos retournés groupés",

  "405C": "2½ saltos retournés groupés",

  "405B": "2½ saltos retournés carpés",

  "407C": "3½ saltos retournés groupés",

  "407B": "3½ saltos retournés carpés",

  "409C": "4½ saltos retournés groupés",

  "5122A": "1 salto avant + 1 vrille",

  "5132D": "1½ salto avant + 1 vrille",

  "5134D": "1½ salto avant + 2 vrilles",

  "5152B": "2½ saltos avant + 1 vrille",

  "5153B": "2½ saltos avant + 1½ vrille",

  "5154B": "2½ saltos avant + 2 vrilles",

  "5162B": "3 saltos avant + 1 vrille",

  "5163B": "3 saltos avant + 1½ vrille",

  "5211A": "Plongeon arrière + ½ vrille",

  "5221A": "1 salto arrière + ½ vrille",

  "5223D": "1 salto arrière + 1½ vrille",

  "5231D": "1½ salto arrière + ½ vrille",

  "5233D": "1½ salto arrière + 1½ vrille",

  "5235D": "1½ salto arrière + 2½ vrilles",

  "5253B": "2½ saltos arrière + 1½ vrille",

  "5255B": "2½ saltos arrière + 2½ vrilles",

  "5257B": "2½ saltos arrière + 3½ vrilles",

  "5263B": "3 saltos arrière + 1½ vrille",

  "5321A": "1 salto renversé + ½ vrille",

  "5323D": "1 salto renversé + 1½ vrille",

  "5331D": "1½ salto renversé + ½ vrille",

  "5333D": "1½ salto renversé + 1½ vrille",

  "5335D": "1½ salto renversé + 2½ vrilles",

  "5337D": "1½ salto renversé + 3½ vrilles",

  "5339D": "1½ salto renversé + 4½ vrilles",

  "5353B": "2½ saltos renversés + 1½ vrille",

  "616C": "Équilibre avant + 3 saltos groupés",

  "6243D": "Équilibre arrière + 2 saltos + 1½ vrille",

  "626C": "Équilibre arrière + 3 saltos groupés",

  "628C": "Équilibre arrière + 4 saltos groupés"

};



/* ============================================================
   DOM
============================================================ */

const pages =
  document.querySelectorAll(
    ".page"
  );


const navigation =
  document.getElementById(
    "navigation"
  );


const mobileMenu =
  document.getElementById(
    "mobileMenu"
  );


const siteModal =
  document.getElementById(
    "siteModal"
  );


const modalContent =
  document.getElementById(
    "modalContent"
  );



/* ============================================================
   OUTILS
============================================================ */

function esc(value) {

  return String(
    value ?? ""
  )
  .replace(
    /[&<>"']/g,
    char => ({

      "&": "&amp;",

      "<": "&lt;",

      ">": "&gt;",

      '"': "&quot;",

      "'": "&#39;"

    }[char])
  );

}


function val(id) {

  const element =
    document.getElementById(
      id
    );

  return element
    ?
    String(
      element.value || ""
    )
    :
    "";

}


function fmtDate(value) {

  if (!value) {
    return "";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(value);
  }


  return date.toLocaleDateString(
    "fr-FR"
  );

}


function normalizeBlazonName(name) {

  return String(
    name || ""
  )
  .normalize("NFD")
  .replace(
    /[\u0300-\u036f]/g,
    ""
  )
  .toUpperCase()
  .trim()
  .replace(
    /^BLAZON\s+/,
    ""
  )
  .replace(
    /^LE\s+BLAZON\s+/,
    ""
  );

}


function driveImage(
  url,
  size = 1000
) {

  const value =
    String(
      url || ""
    );


  if (!value) {
    return "";
  }


  let match =
    value.match(
      /\/file\/d\/([a-zA-Z0-9_-]+)/
    );


  if (
    !match
  ) {

    match =
      value.match(
        /[?&]id=([a-zA-Z0-9_-]+)/
      );
  }


  if (
    match &&
    match[1]
  ) {

    return (
      "https://drive.google.com/thumbnail?id="
      +
      encodeURIComponent(
        match[1]
      )
      +
      "&sz=w"
      +
      size
    );
  }


  return value;
}


function setLoadingButton(
  button,
  loading,
  loadingText,
  normalText
) {

  if (!button) {
    return;
  }


  button.disabled =
    Boolean(loading);


  button.textContent =
    loading
    ?
    loadingText
    :
    normalText;

}



/* ============================================================
   NAVIGATION
============================================================ */

function showPage(
  pageName,
  updateHash = true
) {

  pages.forEach(
    page => {

      page.classList.toggle(
        "active",
        page.id === pageName
      );

    }
  );


  if (
    updateHash &&
    window.location.hash !==
    "#" + pageName
  ) {

    history.replaceState(
      null,
      "",
      window.location.pathname
      +
      window.location.search
      +
      "#"
      +
      pageName
    );
  }


  if (navigation) {

    navigation.classList.remove(
      "open"
    );
  }


  window.scrollTo({
    top: 0,
    behavior: "auto"
  });


  if (
    pageName ===
    "profil"
  ) {

    maybeRestoreDiverProfile();
  }


  if (
    pageName ===
    "club"
  ) {

    restoreCoachSessionFast();
  }


  if (
    pageName ===
    "evaluation" &&
    !state.coachSession
  ) {

    document
      .getElementById(
        "evaluationLocked"
      )
      ?.classList
      .remove(
        "hidden"
      );

    document
      .getElementById(
        "evaluationForm"
      )
      ?.classList
      .add(
        "hidden"
      );
  }

}


document
  .querySelectorAll(
    "[data-page]"
  )
  .forEach(
    link => {

      link.addEventListener(
        "click",
        event => {

          event.preventDefault();

          showPage(
            link.dataset.page
          );

        }
      );

    }
  );


document
  .querySelectorAll(
    "[data-page-button]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          showPage(
            button.dataset.pageButton
          );

        }
      );

    }
  );


document
  .querySelectorAll(
    "[data-open]"
  )
  .forEach(
    card => {

      card.addEventListener(
        "click",
        () => {

          showPage(
            card.dataset.open
          );

        }
      );

    }
  );


if (
  mobileMenu
) {

  mobileMenu.addEventListener(
    "click",
    () => {

      navigation.classList.toggle(
        "open"
      );

    }
  );

}



/* ============================================================
   MODAL
============================================================ */

function openModal(html) {

  if (
    !siteModal ||
    !modalContent
  ) {

    return;
  }


  modalContent.innerHTML =
    html;


  siteModal.classList.add(
    "show"
  );


  siteModal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "modal-open"
  );

}


function closeModal() {

  if (!siteModal) {
    return;
  }


  siteModal.classList.remove(
    "show"
  );


  siteModal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "modal-open"
  );

}


document.addEventListener(
  "click",
  event => {

    if (
      event.target.matches(
        "[data-close-modal]"
      )
    ) {

      closeModal();

    }

  }
);


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Escape"
    ) {

      closeModal();

    }

  }
);



/* ============================================================
   API GET JSONP
============================================================ */

function getJSON(
  action,
  extra = {},
  timeoutMs = 20000
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const callbackName =
        "eah_cb_"
        +
        Date.now()
        +
        "_"
        +
        Math.random()
          .toString(36)
          .slice(2);


      const script =
        document.createElement(
          "script"
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

          delete window[
            callbackName
          ];

          script.remove();

        };


      const timer =
        setTimeout(
          () => {

            cleanup();

            reject(
              new Error(
                "Le serveur met trop de temps à répondre."
              )
            );

          },
          timeoutMs
        );


      window[
        callbackName
      ] =
        data => {

          clearTimeout(
            timer
          );

          cleanup();

          resolve(
            data
          );

        };


      const query =
        new URLSearchParams({

          action,

          callback:
            callbackName,

          ...extra

        });


      script.src =
        API_URL
        +
        "?"
        +
        query.toString();


      script.async =
        true;


      script.onerror =
        () => {

          clearTimeout(
            timer
          );

          cleanup();

          reject(
            new Error(
              "Connexion au serveur impossible."
            )
          );

        };


      document.body.appendChild(
        script
      );

    }
  );

}



/* ============================================================
   API POST IFRAME
============================================================ */

window.addEventListener(
  "message",
  event => {

    const message =
      event.data ||
      {};


    if (
      !message.requestId ||
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


function postIframe(
  data,
  timeoutMs = 30000
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const requestId =
        "req_"
        +
        Date.now()
        +
        "_"
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
          "form"
        );


      form.method =
        "POST";


      form.action =
        API_URL;


      form.target =
        "apiFrame";


      form.style.display =
        "none";


      const payload = {

        ...data,

        transport:
          "iframe",

        requestId

      };


      Object.entries(
        payload
      )
      .forEach(
        ([key,value]) => {

          const field =
            document.createElement(
              "textarea"
            );


          field.name =
            key;


          field.value =
            value == null
            ?
            ""
            :
            String(value);


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
                "Le serveur met trop de temps à répondre."
              )
            );

          }

        },
        timeoutMs
      );

    }
  );

}



/* ============================================================
   BOOTSTRAP PUBLIC
============================================================ */

function loadBootstrapCache() {

  try {

    const raw =
      localStorage.getItem(
        BOOTSTRAP_CACHE_KEY
      );


    if (!raw) {
      return null;
    }


    const cached =
      JSON.parse(
        raw
      );


    if (
      !cached ||
      !cached.data
    ) {

      return null;
    }


    return cached;

  } catch (_) {

    return null;
  }

}


function saveBootstrapCache(data) {

  try {

    localStorage.setItem(
      BOOTSTRAP_CACHE_KEY,
      JSON.stringify({

        time:
          Date.now(),

        data:
          data

      })
    );

  } catch (_) {}

}


function applyBootstrapData(data) {

  if (!data) {
    return;
  }


  if (
    Array.isArray(
      data.blazons
    ) &&
    data.blazons.length
  ) {

    state.blazons =
      data.blazons;

  }


  if (
    Array.isArray(
      data.pricing
    ) &&
    data.pricing.length
  ) {

    state.pricing =
      data.pricing;

  }


  if (
    Array.isArray(
      data.spots
    )
  ) {

    state.spots =
      data.spots;

  }


  if (
    Array.isArray(
      data.actualites
    )
  ) {

    state.actualites =
      data.actualites;

  }


  renderBlazons();

  renderPricing();

  renderSpots();

  renderActualites();

  renderSpotSelect();

}


async function refreshBootstrap() {

  if (
    state.bootstrapPromise
  ) {

    return state.bootstrapPromise;
  }


  state.bootstrapPromise =
    getJSON(
      "bootstrap",
      {},
      25000
    )
    .then(
      response => {

        if (
          response &&
          response.ok
        ) {

          state.bootstrapLoaded =
            true;


          applyBootstrapData(
            response
          );


          saveBootstrapCache(
            response
          );

        }


        return response;

      }
    )
    .catch(
      error => {

        console.warn(
          "Bootstrap :",
          error.message
        );

        return null;

      }
    )
    .finally(
      () => {

        state.bootstrapPromise =
          null;

      }
    );


  return state.bootstrapPromise;

}


function initialisePublicData() {

  /*
    Affichage instantané avant tout appel réseau
  */

  state.blazons =
    BLAZON_FALLBACK.slice();


  state.pricing =
    PRICING_FALLBACK.slice();


  renderBlazons();

  renderPricing();


  /*
    Anciennes données disponibles dans le navigateur
  */

  const cached =
    loadBootstrapCache();


  if (
    cached &&
    cached.data
  ) {

    applyBootstrapData(
      cached.data
    );

  }


  /*
    Actualisation non bloquante
  */

  setTimeout(
    refreshBootstrap,
    10
  );

}



/* ============================================================
   BLAZONS
============================================================ */

function blazonImage(
  blazon
) {

  const key =
    normalizeBlazonName(
      blazon.key ||
      blazon.name
    );


  if (
    BLAZON_IMAGES[key]
  ) {

    return BLAZON_IMAGES[
      key
    ];
  }


  const backendImage =
    String(
      blazon.imageUrl || ""
    );


  if (
    backendImage
  ) {

    return backendImage
      .replace(
        /^assets\/img\//,
        ""
      );
  }


  return "";

}


function renderBlazons() {

  const grid =
    document.getElementById(
      "blazonGrid"
    );


  if (!grid) {
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
              blazon
            );


          return `
            <article
              class="blazon-card"
              data-blazon-index="${index}"
            >

              ${
                image
                ?
                `
                <img
                  src="${esc(image)}"
                  alt="${esc(blazon.name)}"
                  loading="lazy"
                  decoding="async"
                >
                `
                :
                ""
              }

              <h3>
                ${esc(blazon.name)}
              </h3>

              <span>
                Voir les critères →
              </span>

            </article>
          `;

        }
      )
      .join("");


  grid
    .querySelectorAll(
      "[data-blazon-index]"
    )
    .forEach(
      card => {

        card.addEventListener(
          "click",
          () => {

            openBlazon(
              Number(
                card.dataset.blazonIndex
              )
            );

          }
        );

      }
    );

}


async function openBlazon(index) {

  let blazon =
    state.blazons[
      index
    ];


  if (!blazon) {
    return;
  }


  if (
    !blazon.rules
  ) {

    openModal(`
      <div class="modal-inner">

        <span class="overline">
          BLAZON EAH
        </span>

        <h2>
          ${esc(blazon.name)}
        </h2>

        <div class="loading-panel">
          Chargement des critères…
        </div>

      </div>
    `);


    await refreshBootstrap();


    blazon =
      state.blazons[
        index
      ];


    if (
      !blazon ||
      !blazon.rules
    ) {

      openModal(`
        <div class="modal-inner">

          <h2>
            ${esc(
              blazon
              ?
              blazon.name
              :
              "Blazon"
            )}
          </h2>

          <div class="notice error">
            Les critères ne sont pas disponibles actuellement.
          </div>

        </div>
      `);

      return;
    }

  }


  const rules =
    blazon.rules ||
    {};


  const series = [

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


  let html = `

    <div class="modal-inner">

      <span class="overline">
        PROGRESSION EAH
      </span>

      <h2>
        ${esc(blazon.name)}
      </h2>

      ${
        rules.summary
        ?
        `
        <div class="modal-note">
          ${esc(rules.summary)}
        </div>
        `
        :
        ""
      }
  `;


  series.forEach(
    serie => {

      const label =
        serie.label
        ||
        (
          Number(
            serie.height
          ) ===
          0
          ?
          "Bord / plot"
          :
          serie.height +
          " m"
        );


      html += `

        <div class="blazon-series">

          <h3>
            ${esc(label)}
          </h3>

          <p>

            <strong>
              Validation :
            </strong>

            ${esc(serie.minWa)}/10 World Aquatics

            ou

            ${esc(serie.minEah)}/10 EAH Diving

          </p>
      `;


      if (
        Array.isArray(
          serie.alternativeHeights
        ) &&
        serie.alternativeHeights.length
      ) {

        html += `

          <p>

            <strong>
              Hauteur alternative :
            </strong>

            ${
              serie.alternativeHeights
                .map(
                  height =>
                    esc(height) +
                    " m"
                )
                .join(
                  " • "
                )
            }

          </p>
        `;

      }


      (
        serie.codes ||
        []
      )
      .forEach(
        code => {

          if (
            serie.choiceGroups &&
            serie.choiceGroups[
              code
            ]
          ) {

            html += `

              <div class="choice-group">

                <strong>
                  Au choix :
                </strong>

                ${
                  serie.choiceGroups[
                    code
                  ]
                  .map(
                    choice => `

                      <div>

                        <b>
                          ${esc(choice)}
                        </b>

                        —

                        ${esc(
                          DIVE_NAMES[
                            choice
                          ] || ""
                        )}

                      </div>

                    `
                  )
                  .join("")
                }

              </div>
            `;

          } else {

            html += `

              <p class="dive-rule">

                <strong>
                  ${esc(code)}
                </strong>

                —

                ${esc(
                  DIVE_NAMES[
                    code
                  ] || ""
                )}

              </p>
            `;

          }

        }
      );


      html += `
        </div>
      `;

    }
  );


  html += `
    </div>
  `;


  openModal(
    html
  );

}



/* ============================================================
   TARIFS
============================================================ */

function renderPricing() {

  const grid =
    document.getElementById(
      "pricingGrid"
    );


  if (!grid) {
    return;
  }


  grid.innerHTML =
    state.pricing
      .map(
        pricing => {

          const price =
            typeof pricing.price ===
            "number"
            ?
            pricing.price +
            " €"
            :
            esc(
              pricing.price
            );


          return `

            <article
              class="price-card ${
                pricing.id ===
                "CLUB50"
                ?
                "featured"
                :
                ""
              }"
            >

              <small>
                ${esc(
                  pricing.id ||
                  "EAH"
                )}
              </small>

              <h3>
                ${esc(pricing.name)}
              </h3>

              <div class="price">
                ${price}
              </div>

              <p>
                ${esc(
                  pricing.description ||
                  ""
                )}
              </p>

              ${
                pricing.renewal &&
                pricing.renewal !==
                "—"
                ?
                `
                <div class="price-renewal">
                  Renouvellement :
                  ${esc(pricing.renewal)} €
                </div>
                `
                :
                ""
              }

            </article>
          `;

        }
      )
      .join("");

}



/* ============================================================
   SPOTS
============================================================ */

function renderSpots() {

  const grid =
    document.getElementById(
      "spotsGrid"
    );


  if (!grid) {
    return;
  }


  if (
    !state.spots.length
  ) {

    grid.innerHTML = `
      <div class="loading-panel">
        Les spots seront chargés depuis la base EAH.
      </div>
    `;

    return;
  }


  grid.innerHTML =
    state.spots
      .map(
        spot => {

          const image =
            driveImage(
              spot.photoUrl,
              1200
            );


          const heights =
            String(
              spot.heights ||
              ""
            )
            .split(
              /[,;]+/
            )
            .filter(
              Boolean
            );


          return `

            <article class="spot">

              <div class="spot-picture">

                ${
                  image
                  ?
                  `
                  <img
                    src="${esc(image)}"
                    alt="${esc(spot.name)}"
                    loading="lazy"
                    decoding="async"
                  >
                  `
                  :
                  ""
                }

              </div>


              <div class="spot-content">

                <span class="overline">
                  ${esc(
                    spot.city ||
                    "SPOT EAH"
                  )}
                </span>

                <h2>
                  ${esc(spot.name)}
                </h2>


                <div class="tags">

                  ${
                    heights
                      .map(
                        height => `
                          <span>
                            ${esc(
                              height.trim()
                            )}
                          </span>
                        `
                      )
                      .join("")
                  }

                </div>


                ${
                  spot.address
                  ?
                  `
                  <p>
                    <strong>
                      ${esc(
                        spot.address
                      )}
                    </strong>
                  </p>
                  `
                  :
                  ""
                }


                <p>
                  ${esc(
                    spot.description ||
                    ""
                  )}
                </p>

              </div>

            </article>
          `;

        }
      )
      .join("");

}



/* ============================================================
   ACTUALITES
============================================================ */

function renderActualites() {

  const grid =
    document.getElementById(
      "newsGrid"
    );


  if (!grid) {
    return;
  }


  if (
    !state.actualites.length
  ) {

    grid.innerHTML = `
      <div class="loading-panel">
        Aucune actualité publiée actuellement.
      </div>
    `;

    return;
  }


  grid.innerHTML =
    state.actualites
      .map(
        news => {

          const image =
            driveImage(
              news.imageUrl,
              1200
            );


          return `

            <article
              class="news-card ${
                news.featured
                ?
                "news-featured"
                :
                ""
              }"
            >

              ${
                image
                ?
                `
                <img
                  class="news-image"
                  src="${esc(image)}"
                  alt="${esc(news.title)}"
                  loading="lazy"
                  decoding="async"
                >
                `
                :
                ""
              }


              <div class="news-body">

                <span class="overline">
                  ${esc(
                    news.category ||
                    "EAH DIVING"
                  )}
                </span>

                <h3>
                  ${esc(news.title)}
                </h3>

                ${
                  news.date
                  ?
                  `
                  <small class="muted">
                    ${esc(
                      fmtDate(
                        news.date
                      )
                    )}
                  </small>
                  `
                  :
                  ""
                }


                <p>
                  ${esc(
                    news.summary ||
                    news.content ||
                    ""
                  )}
                </p>


                ${
                  news.linkUrl
                  ?
                  `
                  <a
                    class="button small secondary"
                    href="${esc(news.linkUrl)}"
                    target="_blank"
                    rel="noopener"
                  >
                    En savoir plus
                  </a>
                  `
                  :
                  ""
                }

              </div>

            </article>
          `;

        }
      )
      .join("");

}



/* ============================================================
   GRADING MODALS
============================================================ */

const gradingSheets = {

  D: {

    title:
      "Takeoff — Départ",

    image:
      "grading-takeoff.png",

    text:
      "Coordination, impulsion, trajectoire, fixation et amplitude des bras."

  },


  T: {

    title:
      "Trick — Phase aérienne",

    image:
      "grading-trick.png",

    text:
      "Rotations, contrôle des saltos et vrilles, ligne, ouverture et rythme."

  },


  E: {

    title:
      "Entry — Entrée",

    image:
      "grading-entry.png",

    text:
      "Angle, éclaboussures, position des bras, jambes et axe d'entrée."

  }

};


document
  .querySelectorAll(
    ".grading-card[data-sheet]"
  )
  .forEach(
    card => {

      card.addEventListener(
        "click",
        () => {

          const data =
            gradingSheets[
              card.dataset.sheet
            ];


          if (!data) {
            return;
          }


          openModal(`

            <div class="modal-inner">

              <span class="overline">
                GRILLE EAH
              </span>

              <h2>
                ${esc(data.title)}
              </h2>

              <p>
                ${esc(data.text)}
              </p>

              <img
                class="modal-image"
                src="${esc(data.image)}"
                alt="${esc(data.title)}"
              >

            </div>
          `);

        }
      );

    }
  );



/* ============================================================
   POPULATION
============================================================ */

async function loadPopulation() {

  const code =
    val(
      "populationCode"
    )
    .trim()
    .toUpperCase();


  const box =
    document.getElementById(
      "populationResults"
    );


  if (!box) {
    return;
  }


  box.innerHTML = `
    <div class="loading-panel">
      Recherche…
    </div>
  `;


  try {

    const response =
      await getJSON(
        "population",
        {

          club:
            CLUB,

          code:
            code

        },
        25000
      );


    if (
      !response ||
      !response.ok
    ) {

      throw new Error(
        response
        ?
        response.error
        :
        "Aucune réponse."
      );
    }


    box.innerHTML = `

      <div class="population-stats">

        <div class="stat-card">

          <strong>
            ${esc(
              response.global.people
            )}
          </strong>

          <span>
            Plongeurs EAH
          </span>

        </div>


        <div class="stat-card">

          <strong>
            ${esc(
              response.global.count
            )}
          </strong>

          <span>
            Gradings
          </span>

        </div>


        <div class="stat-card">

          <strong>
            ${
              response.global.avgEah
              ??
              "—"
            }
          </strong>

          <span>
            Moyenne EAH
          </span>

        </div>


        <div class="stat-card">

          <strong>
            ${
              response.global.avgWa
              ??
              "—"
            }
          </strong>

          <span>
            Moyenne WA
          </span>

        </div>

      </div>
    `;

  } catch(error) {

    box.innerHTML = `
      <div class="notice error">
        ${esc(error.message)}
      </div>
    `;

  }

}


document
  .getElementById(
    "populationSearchButton"
  )
  ?.addEventListener(
    "click",
    loadPopulation
  );



/* ============================================================
   CRITERES EVALUATION
============================================================ */

function renderCriteria() {

  Object.entries(
    CRITERIA
  )
  .forEach(
    ([prefix,items]) => {

      const container =
        document.getElementById(
          "criteria" +
          prefix
        );


      if (!container) {
        return;
      }


      container.innerHTML =
        items
          .map(
            (
              item,
              index
            ) => `

              <div>

                <strong>
                  ${prefix}${index + 1}
                </strong>

                —

                ${esc(item)}

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
          .join("");

    }
  );

}



/* ============================================================
   LISTE PLONGEONS
============================================================ */

function renderDiveCodes() {

  const datalist =
    document.getElementById(
      "diveCodes"
    );


  if (!datalist) {
    return;
  }


  datalist.innerHTML =
    Object.entries(
      DIVE_NAMES
    )
    .map(
      ([code,name]) => `

        <option value="${esc(code)}">
          ${esc(name)}
        </option>

      `
    )
    .join("");

}


document
  .getElementById(
    "diveCode"
  )
  ?.addEventListener(
    "input",
    event => {

      const code =
        String(
          event.target.value ||
          ""
        )
        .trim()
        .toUpperCase();


      if (
        DIVE_NAMES[code]
      ) {

        const field =
          document.getElementById(
            "diveName"
          );


        if (field) {

          field.value =
            DIVE_NAMES[
              code
            ];

        }
      }

    }
  );



/* ============================================================
   SELECT SPOTS EVALUATION
============================================================ */

function renderSpotSelect() {

  const select =
    document.getElementById(
      "spotId"
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
        spot => `

          <option
            value="${esc(spot.id)}"
            data-name="${esc(spot.name)}"
          >

            ${esc(spot.name)}
            —
            ${esc(spot.city)}

          </option>
        `
      )
      .join("");

}


document
  .getElementById(
    "spotId"
  )
  ?.addEventListener(
    "change",
    event => {

      const option =
        event.target.options[
          event.target.selectedIndex
        ];


      const name =
        option
        ?
        option.dataset.name
        :
        "";


      if (name) {

        document.getElementById(
          "spotName"
        ).value =
          name;

      }

    }
  );



/* ============================================================
   COACH - RESTAURATION RAPIDE SESSION
============================================================ */

function saveCoachSession() {

  try {

    sessionStorage.setItem(
      "EAH_COACH_SESSION",
      JSON.stringify({

        club:
          CLUB,

        session:
          state.coachSession,

        coach:
          state.coach

      })
    );

  } catch (_) {}

}


function getSavedCoachSession() {

  try {

    const raw =
      sessionStorage.getItem(
        "EAH_COACH_SESSION"
      );


    if (!raw) {
      return null;
    }


    return JSON.parse(
      raw
    );

  } catch (_) {

    return null;
  }

}


function restoreCoachSessionFast() {

  if (
    state.coachSession
  ) {

    showCoachPrivate();

    return true;
  }


  const saved =
    getSavedCoachSession();


  if (
    !saved ||
    !saved.club ||
    !saved.session
  ) {

    return false;
  }


  CLUB =
    saved.club;


  state.coachSession =
    saved.session;


  state.coach =
    saved.coach ||
    {
      name:
        "Coach",
      role:
        "COACH"
    };


  showCoachPrivate();


  renderCachedCoachData();


  /*
    Vérification en arrière-plan.
    L'utilisateur entre immédiatement.
  */

  loadCoachDataFast()
    .catch(
      error => {

        console.warn(
          error
        );

      }
    );


  return true;

}



/* ============================================================
   COACH - AFFICHAGE ESPACE PRIVE
============================================================ */

function showCoachPrivate() {

  document
    .getElementById(
      "clubAccess"
    )
    ?.classList
    .add(
      "hidden"
    );


  document
    .getElementById(
      "coachPrivate"
    )
    ?.classList
    .remove(
      "hidden"
    );


  document
    .getElementById(
      "evaluationLocked"
    )
    ?.classList
    .add(
      "hidden"
    );


  document
    .getElementById(
      "evaluationForm"
    )
    ?.classList
    .remove(
      "hidden"
    );


  const coachText =
    (
      state.coach
      &&
      state.coach.name
      ?
      state.coach.name
      :
      "Coach"
    )
    +
    " • "
    +
    (
      state.coach
      &&
      state.coach.role
      ?
      state.coach.role
      :
      "COACH"
    );


  const badge =
    document.getElementById(
      "dashboardCoachBadge"
    );


  if (badge) {

    badge.textContent =
      coachText;

  }


  const evaluationBadge =
    document.getElementById(
      "coachBadge"
    );


  if (evaluationBadge) {

    evaluationBadge.textContent =
      coachText;

  }

}



/* ============================================================
   CONNEXION COACH MANUELLE
============================================================ */

async function coachQuickLogin() {

  const clubName =
    val(
      "coachClubName"
    )
    .trim();


  const password =
    val(
      "coachPassword"
    )
    .trim();


  const message =
    document.getElementById(
      "loginMsg"
    );


  const button =
    document.getElementById(
      "coachLoginButton"
    );


  if (
    !clubName ||
    !password
  ) {

    message.innerHTML = `
      <div class="notice error">
        Indique le nom du club et le mot de passe.
      </div>
    `;

    return;
  }


  setLoadingButton(
    button,
    true,
    "Connexion…",
    "Accéder à l'espace coach"
  );


  message.innerHTML = `
    <div class="notice">
      Ouverture de l'espace club…
    </div>
  `;


  try {

    const response =
      await postIframe(
        {

          action:
            "coachQuickLogin",

          clubName:
            clubName,

          password:
            password

        },
        30000
      );


    if (
      !response ||
      !response.ok
    ) {

      throw new Error(
        response
        ?
        response.error
        :
        "Connexion refusée."
      );
    }


    CLUB =
      response.club.slug;


    state.coachSession =
      response.session;


    state.coach =
      response.coach;


    saveCoachSession();


    try {

      localStorage.setItem(
        "EAH_LAST_CLUB_NAME",
        clubName
      );

    } catch (_) {}


    showCoachPrivate();


    message.innerHTML =
      "";


    updateClubUrl();


    /*
      Le dashboard se charge APRES ouverture.
    */

    loadCoachDataFast()
      .catch(
        console.warn
      );

  } catch(error) {

    message.innerHTML = `
      <div class="notice error">
        ${esc(error.message)}
      </div>
    `;

  } finally {

    setLoadingButton(
      button,
      false,
      "",
      "Accéder à l'espace coach"
    );

  }

}



/* ============================================================
   NFC COACH
============================================================ */

async function coachNfcLogin() {

  if (
    !CLUB ||
    !COACH_NFC_TOKEN
  ) {

    return;
  }


  /*
    Si ce navigateur possède déjà une session pour ce club,
    ouverture sans aucune attente.
  */

  const saved =
    getSavedCoachSession();


  if (
    saved &&
    saved.club ===
    CLUB &&
    saved.session
  ) {

    state.coachSession =
      saved.session;


    state.coach =
      saved.coach;


    showPage(
      "club",
      false
    );


    showCoachPrivate();


    renderCachedCoachData();


    loadCoachDataFast()
      .catch(
        console.warn
      );


    return;
  }


  showPage(
    "club",
    false
  );


  const status =
    document.getElementById(
      "fastAccessStatus"
    );


  status.classList.remove(
    "hidden"
  );


  status.innerHTML = `
    <div class="fast-login">
      ⚡ Ouverture de l'espace coach…
    </div>
  `;


  document
    .getElementById(
      "clubAccess"
    )
    ?.classList
    .add(
      "hidden"
    );


  try {

    const response =
      await postIframe(
        {

          action:
            "coachNfcLogin",

          club:
            CLUB,

          token:
            COACH_NFC_TOKEN

        },
        30000
      );


    if (
      !response ||
      !response.ok
    ) {

      throw new Error(
        response
        ?
        response.error
        :
        "Carte NFC Coach invalide."
      );
    }


    state.coachSession =
      response.session;


    state.coach =
      response.coach;


    saveCoachSession();


    status.classList.add(
      "hidden"
    );


    showCoachPrivate();


    loadCoachDataFast()
      .catch(
        console.warn
      );

  } catch(error) {

    status.innerHTML = `
      <div class="notice error">
        ${esc(error.message)}
      </div>
    `;


    document
      .getElementById(
        "clubAccess"
      )
      ?.classList
      .remove(
        "hidden"
      );

  }

}



/* ============================================================
   DONNEES COACH CACHEES
============================================================ */

function renderCachedCoachData() {

  try {

    const dashboardRaw =
      sessionStorage.getItem(
        "EAH_DASHBOARD_" +
        CLUB
      );


    if (dashboardRaw) {

      renderDashboard(
        JSON.parse(
          dashboardRaw
        )
      );

    }


    const diversRaw =
      sessionStorage.getItem(
        "EAH_DIVERS_" +
        CLUB
      );


    if (diversRaw) {

      const divers =
        JSON.parse(
          diversRaw
        );


      state.divers =
        divers.items ||
        [];


      renderDiversSelect();

    }

  } catch (_) {}

}



/* ============================================================
   CHARGEMENT COACH PARALLELE
============================================================ */

async function loadCoachDataFast() {

  if (
    !CLUB ||
    !state.coachSession
  ) {

    return;
  }


  const [
    diversResponse,
    dashboardResponse
  ] =
    await Promise.all([

      getJSON(
        "sessionDivers",
        {

          club:
            CLUB,

          session:
            state.coachSession

        },
        25000
      ),

      getJSON(
        "dashboard",
        {

          club:
            CLUB,

          session:
            state.coachSession

        },
        25000
      )

    ]);


  if (
    diversResponse &&
    diversResponse.ok
  ) {

    state.divers =
      diversResponse.items ||
      [];


    renderDiversSelect();


    try {

      sessionStorage.setItem(
        "EAH_DIVERS_" +
        CLUB,
        JSON.stringify(
          diversResponse
        )
      );

    } catch (_) {}

  }


  if (
    dashboardResponse &&
    dashboardResponse.ok
  ) {

    renderDashboard(
      dashboardResponse
    );


    try {

      sessionStorage.setItem(
        "EAH_DASHBOARD_" +
        CLUB,
        JSON.stringify(
          dashboardResponse
        )
      );

    } catch (_) {}

  }


  if (
    (
      diversResponse &&
      !diversResponse.ok &&
      String(
        diversResponse.error ||
        ""
      )
      .includes(
        "Session"
      )
    )
    ||
    (
      dashboardResponse &&
      !dashboardResponse.ok &&
      String(
        dashboardResponse.error ||
        ""
      )
      .includes(
        "Session"
      )
    )
  ) {

    logoutCoach();

    throw new Error(
      "Session expirée."
    );
  }

}



/* ============================================================
   DASHBOARD
============================================================ */

function renderDashboard(response) {

  if (
    !response ||
    !response.stats
  ) {

    return;
  }


  const stats =
    response.stats;


  const box =
    document.getElementById(
      "dashboardStats"
    );


  box.innerHTML = [

    [
      stats.divers,
      "Plongeurs"
    ],

    [
      stats.evaluations,
      "Grade Reports"
    ],

    [
      stats.verified,
      "EAH Verified"
    ],

    [
      stats.blazons,
      "Blazons obtenus"
    ]

  ]
  .map(
    item => `

      <div class="stat-card">

        <strong>
          ${esc(item[0])}
        </strong>

        <span>
          ${esc(item[1])}
        </span>

      </div>

    `
  )
  .join("");


  const recent =
    document.getElementById(
      "recentDashboard"
    );


  recent.innerHTML =
    (
      response.recent ||
      []
    )
    .map(
      item => `

        <div class="history-item">

          <span>

            <strong>
              ${esc(item.code)}
            </strong>

            <br>

            <small>
              ${esc(
                fmtDate(
                  item.date
                )
              )}
            </small>

          </span>


          <span>

            <strong>
              EAH ${esc(item.eah)}
            </strong>

            ${
              item.verified
              ?
              `
              <br>
              <span class="badge verified">
                VERIFIED
              </span>
              `
              :
              ""
            }

          </span>

        </div>

      `
    )
    .join("")
    ||
    "Aucune évaluation.";


  const groups =
    document.getElementById(
      "groupsDashboard"
    );


  groups.innerHTML =
    Object.entries(
      response.groups ||
      {}
    )
    .map(
      ([name,data]) => `

        <div class="history-item">

          <strong>
            ${esc(name)}
          </strong>

          <span>
            ${esc(data.divers)}
            plongeur(s)
            •
            ${esc(data.evaluations)}
            évaluation(s)
          </span>

        </div>

      `
    )
    .join("")
    ||
    "Aucun groupe.";

}



/* ============================================================
   DIVERS SELECT
============================================================ */

function renderDiversSelect() {

  const select =
    document.getElementById(
      "eahId"
    );


  if (!select) {
    return;
  }


  select.innerHTML =
    state.divers
      .map(
        diver => `

          <option value="${esc(diver.id)}">

            ${esc(diver.name)}
            —
            ${esc(diver.group || "")}

          </option>

        `
      )
      .join("");

}



/* ============================================================
   DECONNEXION COACH
============================================================ */

function logoutCoach() {

  state.coachSession =
    "";


  state.coach =
    null;


  state.divers =
    [];


  try {

    sessionStorage.removeItem(
      "EAH_COACH_SESSION"
    );

  } catch (_) {}


  document
    .getElementById(
      "coachPrivate"
    )
    ?.classList
    .add(
      "hidden"
    );


  document
    .getElementById(
      "clubAccess"
    )
    ?.classList
    .remove(
      "hidden"
    );


  document
    .getElementById(
      "evaluationForm"
    )
    ?.classList
    .add(
      "hidden"
    );


  document
    .getElementById(
      "evaluationLocked"
    )
    ?.classList
    .remove(
      "hidden"
    );


  showPage(
    "club"
  );

}



/* ============================================================
   PROFIL - SESSION NAVIGATEUR
============================================================ */

function saveDiverAuth(
  club,
  id,
  token
) {

  state.diverAuth = {

    club,
    id,
    token

  };


  try {

    sessionStorage.setItem(
      "EAH_DIVER_AUTH",
      JSON.stringify(
        state.diverAuth
      )
    );

  } catch (_) {}

}


function getSavedDiverAuth() {

  try {

    const raw =
      sessionStorage.getItem(
        "EAH_DIVER_AUTH"
      );


    return raw
      ?
      JSON.parse(raw)
      :
      null;

  } catch (_) {

    return null;
  }

}



/* ============================================================
   CONNEXION PLONGEUR SANS NFC
============================================================ */

async function diverQuickLogin() {

  const eahId =
    val(
      "diverEahId"
    )
    .trim()
    .toUpperCase();


  const pin =
    val(
      "diverPin"
    )
    .trim();


  const message =
    document.getElementById(
      "diverLoginMsg"
    );


  const button =
    document.getElementById(
      "diverLoginButton"
    );


  if (
    !eahId ||
    !pin
  ) {

    message.innerHTML = `
      <div class="notice error">
        Numéro EAH et code personnel obligatoires.
      </div>
    `;

    return;
  }


  setLoadingButton(
    button,
    true,
    "Ouverture…",
    "Ouvrir mon profil"
  );


  try {

    const response =
      await postIframe(
        {

          action:
            "diverQuickLogin",

          eahId:
            eahId,

          pin:
            pin

        },
        30000
      );


    if (
      !response ||
      !response.ok
    ) {

      throw new Error(
        response
        ?
        response.error
        :
        "Connexion impossible."
      );
    }


    message.innerHTML =
      "";


    openProfile(
      response.club,
      response.eahId,
      response.token
    );

  } catch(error) {

    message.innerHTML = `
      <div class="notice error">
        ${esc(error.message)}
      </div>
    `;

  } finally {

    setLoadingButton(
      button,
      false,
      "",
      "Ouvrir mon profil"
    );

  }

}



/* ============================================================
   OUVERTURE PROFIL NFC OU LOGIN
============================================================ */

function openProfile(
  club,
  id,
  token
) {

  CLUB =
    String(
      club || ""
    );


  CARD_ID =
    String(
      id || ""
    );


  CARD_TOKEN =
    String(
      token || ""
    );


  saveDiverAuth(
    CLUB,
    CARD_ID,
    CARD_TOKEN
  );


  const newUrl =
    window.location.pathname
    +
    "?club="
    +
    encodeURIComponent(
      CLUB
    )
    +
    "&id="
    +
    encodeURIComponent(
      CARD_ID
    )
    +
    "&token="
    +
    encodeURIComponent(
      CARD_TOKEN
    )
    +
    "#profil";


  history.replaceState(
    null,
    "",
    newUrl
  );


  showPage(
    "profil",
    false
  );


  loadProfileSummaryFast();

}



/* ============================================================
   RESTAURATION PROFIL
============================================================ */

function maybeRestoreDiverProfile() {

  if (
    CARD_ID &&
    CARD_TOKEN &&
    CLUB
  ) {

    if (
      !state.profile
    ) {

      loadProfileSummaryFast();

    }

    return;
  }


  const saved =
    getSavedDiverAuth();


  if (
    saved &&
    saved.club &&
    saved.id &&
    saved.token
  ) {

    CLUB =
      saved.club;


    CARD_ID =
      saved.id;


    CARD_TOKEN =
      saved.token;


    if (
      !state.profile
    ) {

      loadProfileSummaryFast();

    }

  } else {

    document
      .getElementById(
        "profileNoAuth"
      )
      ?.classList
      .remove(
        "hidden"
      );

  }

}



/* ============================================================
   CACHE PROFIL
============================================================ */

function profileCacheKey() {

  return (
    "EAH_PROFILE_"
    +
    CLUB
    +
    "_"
    +
    CARD_ID
  );

}


function historyCacheKey() {

  return (
    "EAH_HISTORY_"
    +
    CLUB
    +
    "_"
    +
    CARD_ID
  );

}



/* ============================================================
   PROFIL RESUME RAPIDE
============================================================ */

async function loadProfileSummaryFast() {

  if (
    !CLUB ||
    !CARD_ID ||
    !CARD_TOKEN
  ) {

    return;
  }


  const loading =
    document.getElementById(
      "profileLoading"
    );


  const noAuth =
    document.getElementById(
      "profileNoAuth"
    );


  const setup =
    document.getElementById(
      "profileSetup"
    );


  const view =
    document.getElementById(
      "profileView"
    );


  noAuth?.classList.add(
    "hidden"
  );


  setup?.classList.add(
    "hidden"
  );


  /*
    Cache session : affichage instantané lors d'un retour.
  */

  try {

    const cached =
      sessionStorage.getItem(
        profileCacheKey()
      );


    if (cached) {

      const data =
        JSON.parse(cached);


      if (
        data.profile &&
        !data.needsSetup
      ) {

        state.profile =
          data.profile;


        renderProfileSummary(
          data.profile
        );


        renderCachedProfileHistory();

      } else {

        loading?.classList.remove(
          "hidden"
        );

      }

    } else {

      loading?.classList.remove(
        "hidden"
      );

    }

  } catch (_) {

    loading?.classList.remove(
      "hidden"
    );

  }


  try {

    const response =
      await getJSON(
        "profileSummary",
        {

          club:
            CLUB,

          id:
            CARD_ID,

          token:
            CARD_TOKEN

        },
        25000
      );


    loading?.classList.add(
      "hidden"
    );


    if (
      !response ||
      !response.ok
    ) {

      throw new Error(
        response
        ?
        response.error
        :
        "Profil indisponible."
      );
    }


    try {

      sessionStorage.setItem(
        profileCacheKey(),
        JSON.stringify(
          response
        )
      );

    } catch (_) {}


    if (
      response.needsSetup
    ) {

      setup?.classList.remove(
        "hidden"
      );


      view?.classList.add(
        "hidden"
      );


      return;
    }


    state.profile =
      response.profile;


    renderProfileSummary(
      response.profile
    );


    /*
      Historique chargé ensuite.
      L'identité du plongeur est déjà affichée.
    */

    loadProfileHistoryFast()
      .catch(
        console.warn
      );

  } catch(error) {

    loading?.classList.add(
      "hidden"
    );


    view?.classList.remove(
      "hidden"
    );


    view.innerHTML = `
      <div class="notice error">
        ${esc(error.message)}
      </div>
    `;

  }

}



/* ============================================================
   RENDU PROFIL RESUME
============================================================ */

function renderProfileSummary(profile) {

  const view =
    document.getElementById(
      "profileView"
    );


  if (!view) {
    return;
  }


  document
    .getElementById(
      "profileLoading"
    )
    ?.classList
    .add(
      "hidden"
    );


  document
    .getElementById(
      "profileSetup"
    )
    ?.classList
    .add(
      "hidden"
    );


  view.classList.remove(
    "hidden"
  );


  const image =
    driveImage(
      profile.photoUrl,
      600
    );


  view.innerHTML = `

    <div class="profile-card">

      <div class="profile-head">

        ${
          image
          ?
          `
          <img
            class="profile-avatar"
            src="${esc(image)}"
            alt="${esc(
              profile.firstName
            )}"
          >
          `
          :
          `
          <div class="profile-avatar profile-avatar-empty">
            EAH
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

          <p class="muted">

            ${esc(profile.club)}

            ${
              profile.group
              ?
              " • " +
              esc(profile.group)
              :
              ""
            }

          </p>

          <p>

            <strong>
              Blazon actuel :
            </strong>

            ${esc(
              profile.currentBlazon ||
              "En progression"
            )}

          </p>


          ${
            profile.cardStatus
            ?
            `
            <span
              class="card-status ${cardStatusClass(
                profile.cardStatus
              )}"
            >
              ${esc(profile.cardStatus)}
            </span>
            `
            :
            ""
          }

        </div>

      </div>

    </div>


    <div class="profile-content-grid">

      <article class="dashboard-card">

        <h3>
          Progression des blazons
        </h3>

        <div id="profileBlazons">
          <div class="mini-loading">
            Chargement…
          </div>
        </div>

      </article>


      <article class="dashboard-card">

        <h3>
          Historique
        </h3>

        <div id="profileHistory">
          <div class="mini-loading">
            Chargement…
          </div>
        </div>

      </article>

    </div>
  `;

}


function cardStatusClass(status) {

  const value =
    String(
      status || ""
    )
    .toUpperCase();


  if (
    value ===
    "ATTRIBUÉE"
  ) {

    return "status-assigned";
  }


  if (
    value ===
    "PERDUE"
  ) {

    return "status-lost";
  }


  return "status-free";

}



/* ============================================================
   HISTORIQUE PROFIL
============================================================ */

function renderCachedProfileHistory() {

  try {

    const cached =
      sessionStorage.getItem(
        historyCacheKey()
      );


    if (!cached) {
      return;
    }


    renderProfileHistory(
      JSON.parse(
        cached
      )
    );

  } catch (_) {}

}


async function loadProfileHistoryFast() {

  if (
    !CLUB ||
    !CARD_ID ||
    !CARD_TOKEN
  ) {

    return;
  }


  const response =
    await getJSON(
      "profileHistory",
      {

        club:
          CLUB,

        id:
          CARD_ID,

        token:
          CARD_TOKEN

      },
      30000
    );


  if (
    !response ||
    !response.ok
  ) {

    throw new Error(
      response
      ?
      response.error
      :
      "Historique indisponible."
    );
  }


  state.profileHistory =
    response;


  try {

    sessionStorage.setItem(
      historyCacheKey(),
      JSON.stringify(
        response
      )
    );

  } catch (_) {}


  renderProfileHistory(
    response
  );

}


function renderProfileHistory(data) {

  const blazons =
    document.getElementById(
      "profileBlazons"
    );


  const history =
    document.getElementById(
      "profileHistory"
    );


  if (blazons) {

    blazons.innerHTML =
      (
        data.blazons ||
        []
      )
      .map(
        item => `

          <div class="history-item">

            <span>
              ${esc(item.name)}
            </span>

            <span>

              ${
                String(
                  item.status
                ) ===
                "OBTENU"
                ?
                `
                <span class="badge">
                  OBTENU
                </span>
                `
                :
                esc(item.progress) +
                " %"
              }

            </span>

          </div>
        `
      )
      .join("")
      ||
      "Aucune progression enregistrée.";

  }


  if (history) {

    history.innerHTML =
      (
        data.evaluations ||
        []
      )
      .map(
        evaluation => `

          <div class="history-item profile-history-item">

            <span>

              <strong>
                ${esc(evaluation.code)}
              </strong>

              —

              ${esc(evaluation.height)}
              m

              <br>

              <small>

                ${esc(
                  fmtDate(
                    evaluation.date
                  )
                )}

                ${
                  evaluation.spot
                  ?
                  " • " +
                  esc(
                    evaluation.spot
                  )
                  :
                  ""
                }

              </small>

            </span>


            <span class="history-score">

              <strong>
                EAH
                ${esc(evaluation.eah)}/10
              </strong>


              ${
                evaluation.verified
                ?
                `
                <span class="badge verified">
                  EAH VERIFIED
                </span>
                `
                :
                ""
              }


              ${
                evaluation.reportUrl
                ?
                `
                <a
                  href="${esc(
                    evaluation.reportUrl
                  )}"
                  target="_blank"
                  rel="noopener"
                >
                  Grade Report
                </a>
                `
                :
                ""
              }

            </span>

          </div>

        `
      )
      .join("")
      ||
      "Aucune évaluation.";

  }

}



/* ============================================================
   PREMIERE ACTIVATION PROFIL
============================================================ */

async function setupProfile() {

  const message =
    document.getElementById(
      "setupProfileMsg"
    );


  const button =
    document.getElementById(
      "setupProfileButton"
    );


  const firstName =
    val(
      "setupFirstName"
    )
    .trim();


  const lastName =
    val(
      "setupLastName"
    )
    .trim();


  const accessPin =
    val(
      "setupAccessPin"
    )
    .trim();


  if (
    !firstName ||
    !lastName
  ) {

    message.innerHTML = `
      <div class="notice error">
        Le prénom et le nom sont obligatoires.
      </div>
    `;

    return;
  }


  if (
    !/^[0-9]{4,8}$/.test(
      accessPin
    )
  ) {

    message.innerHTML = `
      <div class="notice error">
        Le code personnel doit contenir 4 à 8 chiffres.
      </div>
    `;

    return;
  }


  setLoadingButton(
    button,
    true,
    "Activation…",
    "Activer mon profil"
  );


  try {

    const response =
      await postIframe(
        {

          action:
            "setupProfile",

          club:
            CLUB,

          eahId:
            CARD_ID,

          token:
            CARD_TOKEN,

          firstName:
            firstName,

          lastName:
            lastName,

          photoUrl:
            val(
              "setupPhotoUrl"
            ),

          birthDate:
            val(
              "setupBirthDate"
            ),

          sex:
            val(
              "setupSex"
            ),

          group:
            val(
              "setupGroup"
            ),

          accessPin:
            accessPin

        },
        45000
      );


    if (
      !response ||
      !response.ok
    ) {

      throw new Error(
        response
        ?
        response.error
        :
        "Activation impossible."
      );
    }


    try {

      sessionStorage.removeItem(
        profileCacheKey()
      );

    } catch (_) {}


    state.profile =
      response.profile;


    renderProfileSummary(
      response.profile
    );


    loadProfileHistoryFast()
      .catch(
        console.warn
      );

  } catch(error) {

    message.innerHTML = `
      <div class="notice error">
        ${esc(error.message)}
      </div>
    `;

  } finally {

    setLoadingButton(
      button,
      false,
      "",
      "Activer mon profil"
    );

  }

}



/* ============================================================
   EVALUATION
============================================================ */

async function submitEvaluation(event) {

  event.preventDefault();


  if (
    !state.coachSession
  ) {

    showPage(
      "club"
    );

    return;
  }


  const button =
    document.getElementById(
      "submitEvalBtn"
    );


  const message =
    document.getElementById(
      "evaluationMsg"
    );


  setLoadingButton(
    button,
    true,
    "Génération en cours…",
    "Générer le Grade Report"
  );


  message.innerHTML = `
    <div class="notice">
      Génération du Grade Report…
    </div>
  `;


  try {

    let videoBase64 =
      "";

    let videoName =
      "";

    let videoMime =
      "";


    const file =
      document.getElementById(
        "videoFile"
      )
      .files[0];


    if (file) {

      if (
        file.size >
        20 * 1024 * 1024
      ) {

        throw new Error(
          "La vidéo dépasse 20 Mo. Utilise plutôt un lien vidéo."
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
        "video/mp4";

    }


    const data = {

      action:
        "submitEvaluation",

      club:
        CLUB,

      session:
        state.coachSession,

      eahId:
        val("eahId"),

      discipline:
        val("discipline"),

      diveCode:
        val("diveCode"),

      diveName:
        val("diveName"),

      height:
        val("height"),

      spotId:
        val("spotId"),

      spotName:
        val("spotName"),

      waScore:
        val("waScore"),

      dd:
        val("dd"),

      eahDifficulty:
        val("eahDifficulty"),

      positive:
        val("positive"),

      improve:
        val("improve"),

      comment:
        val("comment"),

      videoUrl:
        val("videoUrl"),

      videoBase64,

      videoName,

      videoMime,

      videoQrAccessible:
        document.getElementById(
          "videoQrAccessible"
        ).checked

    };


    [
      "D",
      "T",
      "E"
    ]
    .forEach(
      prefix => {

        for (
          let i = 1;
          i <= 5;
          i++
        ) {

          data[
            prefix + i
          ] =
            val(
              prefix + i
            );

        }

      }
    );


    const response =
      await postIframe(
        data,
        150000
      );


    if (
      !response ||
      !response.ok
    ) {

      throw new Error(
        response
        ?
        response.error
        :
        "Erreur de génération."
      );
    }


    message.innerHTML = `

      <div class="notice success">

        <strong>
          Grade Report généré.
        </strong>

        <br><br>

        Takeoff :
        ${esc(response.takeoff)}/10

        •

        Trick :
        ${esc(response.trick)}/10

        •

        Entry :
        ${esc(response.entry)}/10

        <br>

        <strong>
          EAH :
          ${esc(response.eahScore)}/10
        </strong>


        ${
          response.reportUrl
          ?
          `
          <br><br>

          <a
            class="button small"
            href="${esc(response.reportUrl)}"
            target="_blank"
            rel="noopener"
          >
            Ouvrir le Grade Report
          </a>
          `
          :
          ""
        }

      </div>
    `;


    loadCoachDataFast()
      .catch(
        console.warn
      );

  } catch(error) {

    message.innerHTML = `
      <div class="notice error">
        ${esc(error.message)}
      </div>
    `;

  } finally {

    setLoadingButton(
      button,
      false,
      "",
      "Générer le Grade Report"
    );

  }

}


function fileToDataUrl(file) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();


      reader.onload =
        () => resolve(
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



/* ============================================================
   FORMULAIRE PUBLIC
============================================================ */

async function submitPublicGrading(event) {

  event.preventDefault();


  const button =
    document.getElementById(
      "publicSubmitButton"
    );


  const message =
    document.getElementById(
      "publicFormMessage"
    );


  setLoadingButton(
    button,
    true,
    "Envoi…",
    "Envoyer la demande"
  );


  try {

    const response =
      await postIframe(
        {

          action:
            "publicGradingRequest",

          firstName:
            val(
              "publicFirstName"
            ),

          lastName:
            val(
              "publicLastName"
            ),

          email:
            val(
              "publicEmail"
            ),

          discipline:
            val(
              "publicDiscipline"
            ),

          dive:
            val(
              "publicDive"
            ),

          height:
            val(
              "publicHeight"
            ),

          heightType:
            val(
              "publicHeightType"
            ),

          video:
            val(
              "publicVideo"
            ),

          message:
            val(
              "publicMessage"
            )

        },
        30000
      );


    if (
      !response ||
      !response.ok
    ) {

      throw new Error(
        response
        ?
        response.error
        :
        "Envoi impossible."
      );
    }


    message.innerHTML = `
      <div class="notice success">
        Demande enregistrée.
      </div>
    `;


    document
      .getElementById(
        "publicGradingForm"
      )
      .reset();

  } catch(error) {

    message.innerHTML = `
      <div class="notice error">
        ${esc(error.message)}
      </div>
    `;

  } finally {

    setLoadingButton(
      button,
      false,
      "",
      "Envoyer la demande"
    );

  }

}



/* ============================================================
   URL CLUB
============================================================ */

function updateClubUrl() {

  const hash =
    window.location.hash ||
    "#club";


  const query =
    CLUB
    ?
    "?club="
      +
      encodeURIComponent(
        CLUB
      )
    :
    "";


  history.replaceState(
    null,
    "",
    window.location.pathname
    +
    query
    +
    hash
  );

}



/* ============================================================
   EVENTS
============================================================ */

document
  .getElementById(
    "coachLoginButton"
  )
  ?.addEventListener(
    "click",
    coachQuickLogin
  );


document
  .getElementById(
    "diverLoginButton"
  )
  ?.addEventListener(
    "click",
    diverQuickLogin
  );


document
  .getElementById(
    "setupProfileButton"
  )
  ?.addEventListener(
    "click",
    setupProfile
  );


document
  .getElementById(
    "logoutCoachButton"
  )
  ?.addEventListener(
    "click",
    logoutCoach
  );


document
  .getElementById(
    "openEvaluationButton"
  )
  ?.addEventListener(
    "click",
    () => {

      showPage(
        "evaluation"
      );

    }
  );


document
  .getElementById(
    "evaluationForm"
  )
  ?.addEventListener(
    "submit",
    submitEvaluation
  );


document
  .getElementById(
    "publicGradingForm"
  )
  ?.addEventListener(
    "submit",
    submitPublicGrading
  );


document
  .getElementById(
    "coachPassword"
  )
  ?.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Enter"
      ) {

        coachQuickLogin();

      }

    }
  );


document
  .getElementById(
    "diverPin"
  )
  ?.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Enter"
      ) {

        diverQuickLogin();

      }

    }
  );



/* ============================================================
   INITIALISATION
============================================================ */

function initialiseLastClubName() {

  try {

    const name =
      localStorage.getItem(
        "EAH_LAST_CLUB_NAME"
      );


    if (
      name &&
      document.getElementById(
        "coachClubName"
      )
    ) {

      document.getElementById(
        "coachClubName"
      ).value =
        name;

    }

  } catch (_) {}

}


function initialRoute() {

  /*
    PRIORITE 1 :
    scan carte plongeur
  */

  if (
    CLUB &&
    CARD_ID &&
    CARD_TOKEN
  ) {

    saveDiverAuth(
      CLUB,
      CARD_ID,
      CARD_TOKEN
    );


    showPage(
      "profil",
      false
    );


    /*
      Lance immédiatement l'appel profil.
      Le bootstrap public continue en parallèle.
    */

    loadProfileSummaryFast();


    return;
  }


  /*
    PRIORITE 2 :
    carte NFC Coach
  */

  if (
    CLUB &&
    COACH_NFC_TOKEN
  ) {

    coachNfcLogin();


    return;
  }


  /*
    ROUTE CLASSIQUE
  */

  const hash =
    window.location.hash
      .replace(
        "#",
        ""
      );


  if (
    hash &&
    document.getElementById(
      hash
    )
  ) {

    showPage(
      hash,
      false
    );

  } else {

    showPage(
      "accueil",
      false
    );

  }

}


function init() {

  /*
    Ces éléments sont entièrement locaux :
    aucun temps réseau.
  */

  renderCriteria();

  renderDiveCodes();

  initialiseLastClubName();


  /*
    Blazons / prix apparaissent immédiatement.
    Les informations serveur sont mises à jour ensuite.
  */

  initialisePublicData();


  /*
    Session coach existante.
  */

  restoreCoachSessionFast();


  /*
    Gestion NFC / URL / route.
  */

  initialRoute();

}


init();
