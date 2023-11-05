const API_KEY = 'AIzaSyBHBWWQGCxKyKGmCq7bh2NvsMFuFlutoAQ';
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const router = new Navigo('/', { hash: true });

const main = document.querySelector('main');

const favoriteIds = JSON.parse(localStorage.getItem('favoriteVJ') || '[]');

const preload = {
  elem: document.createElement('div'),
  text: '<p class="preload__text">Загрузка...</p>',
  append() {
    main.style.display = 'flex';
    main.style.margin = 'auto';
    main.append(this.elem);
  },
  remove() {
    main.style.display = '';
    main.style.margin = '';
    this.elem.remove();
  },
  init() {
    this.elem.className = 'preload';
    this.elem.innerHTML = this.text;
  },
};
preload.init();

const convertDuration = (isoDuration) => {
  const hoursMatch = isoDuration.match(/(\d+)H/);
  const minutesMatch = isoDuration.match(/(\d+)M/);
  const secondsMatch = isoDuration.match(/(\d+)S/);

  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
  const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;

  let result = '';

  if (hours > 0) {
    result += `${hours} ч `;
  }

  if (minutes > 0) {
    result += `${minutes} мин `;
  }

  if (seconds > 0) {
    result += `${seconds} сек`;
  }

  return result.trim();
};

const fetchTrendingVideos = async () => {
  try {
    const url = new URL(VIDEOS_URL);

    url.searchParams.append('part', 'contentDetails,id,snippet');
    url.searchParams.append('chart', 'mostPopular');
    url.searchParams.append('regionCode', 'RU');
    url.searchParams.append('maxResults', '12');
    url.searchParams.append('key', API_KEY);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('error: ', error);
  }
};

const fetchFavoriteVideos = async () => {
  try {
    if (favoriteIds.lenght === 0) {
      return { items: [] };
    }
    const url = new URL(VIDEOS_URL);

    url.searchParams.append('part', 'contentDetails,id,snippet');
    url.searchParams.append('maxResults', '12');
    url.searchParams.append('id', favoriteIds.join(','));
    url.searchParams.append('key', API_KEY);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('error: ', error);
  }
};

const fetchVideoData = async (id) => {
  try {
    const url = new URL(VIDEOS_URL);

    url.searchParams.append('part', 'snippet,statistics');
    url.searchParams.append('id', id);
    url.searchParams.append('key', API_KEY);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('error: ', error);
  }
};

const createListVideo = (videos, titleText, pagination) => {
  const videoListSection = document.createElement('section');
  videoListSection.classList.add('video-list');

  const container = document.createElement('div');
  container.classList.add('container');

  const title = document.createElement('h2');
  title.classList.add('video-list__title');
  title.textContent = titleText;

  const videoListItems = document.createElement('ul');
  videoListItems.classList.add('video-list__items');

  const listVideos = videos.items.map((video) => {
    const li = document.createElement('li');
    li.classList.add('video-list__item');
    li.innerHTML = `
      <article class="video-card">
                <a class="video-card__link" href="/video.html?id=${video.id}">
                  <img
                    class="video-card__thumbnail"
                    src="${
                      video.snippet.thumbnails.standard?.url ||
                      video.snippet.thumbnails.high?.url
                    }"
                    alt="${video.snippet.title}"
                  />
                  <h3 class="video-card__title">${video.snippet.title}</h3>
                  <p class="video-card__channel">${
                    video.snippet.channelTitle
                  }</p>
                  <p class="video-card__duration">${convertDuration(
                    video.contentDetails.duration
                  )}</p>
                </a>
                <button
                  class="video-card__favorite favorite ${
                    favoriteIds.includes(video.id) ? 'active' : ''
                  }"
                  type="button"
                  aria-label="Добавить в избранное, ${video.snippet.title}"
                  data-video-id="${video.id}">
                                  <svg class="video-card__icon">
                    <use
                      class="star-o"
                      xlink:href="/image/sprite.svg#star-ob"
                    ></use>
                    <use class="star" xlink:href="/image/sprite.svg#star"></use>
                  </svg>
                </button>
              </article>
      `;
    return li;
  });
  videoListItems.append(...listVideos);

  return videoListSection;
};

const displayVideo = ({ items: [video] }) => {
  const videoElem = document.querySelector('.video');
  console.log('video: ', video);
  videoElem.innerHtml = `
  <div class="container">
          <div class="video__player">
          <iframe src="https://www.youtube.com/embed/${video.id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          </div>
          <div class="video__container">
            <div class="video__content">
              <h3 class="video__title">${video.snippet.title}</h3>
              <p class="video__channel">Правое полушарие интроверта</p>
              <p class="video__info">
                <span class="video__views">1 575 581 просмотр</span>
                <span class="video__date">Дата премьеры: 16 авг. 2024 г.</span>
              </p>
              <p class="video__description">
                Смотрите наш курс-саммари «Как понимать философию» фоном.
              </p>
            </div>
            <button class="video__link favorite" href="/favorite.html">
              <span class="video__no-favorite">Избранное</span>
              <span class="video__favorite">В избранном</span>
              <svg class="video__icon">
                <use xlink:href="/image/sprite.svg#star-ob"></use>
              </svg>
            </button>
          </div>
        </div>
        `;
};

const createHero = () => {
  const heroSection = document.createElement('section');
  heroSection.className = 'hero';

  heroSection.innerHTML = `
          <div class="container">
          <div class="hero__container">
            <a class="hero__link" href="/favorite.html"
              ><span class="hero__link-text">Избранное</span>
              <svg class="hero__icon">
                <use xlink:href="/image/sprite.svg#star-ow"></use>
              </svg>
            </a>
            <svg
              class="hero__logo"
              viewBox="0 0 347 38"
              role="img"
              aria-label="Логотип сервиса video-jokes"
            >
              <use xlink:href="/image/sprite.svg#logo-white"></use>
            </svg>
            <h1 class="hero__title">Смотри. Загружай. Создавай</h1>
            <p class="hero__tagline">Смешное видео для тебя</p>
          </div>
        </div>
        `;
  return heroSection;
};

const createSearch = () => {
  const searchSection = document.createElement('section');
  searchSection.className = 'search';

  const container = document.createElement('div');
  container.className = 'container';

  const title = document.createElement('h2');
  title.className = 'visually-hidden';
  title.textContent = 'Поиск';

  const form = document.createElement('form');
  form.className = 'search__form';

  searchSection.append(container);
  container.append(title, form);
  form.innerHTML = `
  <input
              class="search__input"
              type="search" name="search"
              placeholder="Найти видео..."
            />
            <button class="search__btn" type="submit">
              <span>поиск</span>
              <svg class="search__icon">
                <use xlink:href="/image/sprite.svg#search"></use>
              </svg>
            </button>
  `;
  return searchSection;
};

const indexRoute = async () => {
  main.textContent = '';
  preload.append();
  const hero = createHero();
  const search = createSearch();
  const videos = await fetchTrendingVideos();
  preload.remove();
  const listVideo = createListVideo(videos);
  main.append(hero, search, listVideo);
};

const videoRoute = () => {};
const favoriteRoute = () => {};
const searchRoute = () => {};

const init = () => {
  router
    .on({
      '/': indexRoute,
      '/video/:id': videoRoute,
      '/favorite': favoriteRoute,
      '/search': searchRoute,
    })
    .resolve();

  document.body.addEventListener('click', ({ target }) => {
    const itemFavorite = target.closest('.favorite');

    if (itemFavorite) {
      const videoId = itemFavorite.dataset.videoId;
      if (favoriteIds.includes(videoId)) {
        favoriteIds.splice(favoriteIds.indexOf(videoId), 1);
        localStorage.setItem('favoriteVJ', JSON.stringify(favoriteIds));
        itemFavorite.classList.remove('active');
      } else {
        favoriteIds.push(videoId);
        localStorage.setItem('favoriteVJ', JSON.stringify(favoriteIds));
        itemFavorite.classList.add('active');
      }
    }
  });
};
init();
