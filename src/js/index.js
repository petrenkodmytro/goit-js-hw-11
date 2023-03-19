import axios from 'axios';
import Notiflix from 'notiflix';
// Описаний в документації
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

const seachFormRef = document.querySelector('.search-form');
const seachMore = document.querySelector('.load-more');
const galleryRef = document.querySelector('.gallery');

// фунцція бібліотеки SimpleLightbox
// var lightbox = new SimpleLightbox('.gallery a', { /* options */ });
const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

let seachValue = '';
let pageNumber;

seachMore.style.display = 'none';

seachFormRef.addEventListener('submit', onSeachImageSubmit);
seachMore.addEventListener('click', onSeachMoreImageClick);

// функція першого пошуку
async function onSeachImageSubmit(e) {
  e.preventDefault();

  galleryRef.innerHTML = '';
  seachValue = e.currentTarget.elements.searchQuery.value.trim();

  if (seachValue === '') {
    Notiflix.Notify.info('Please enter something for seach.');
    seachMore.style.display = 'none';
    return;
  }

  pageNumber = 1;

  const response = await fetchData(seachValue, pageNumber);
  // console.log(response.data);

  isCheckedLengthOfArrayImage(response);

  // if (response.data.hits.length === 0) {
  //   Notiflix.Notify.failure(
  //     'Sorry, there are no images matching your search query. Please try again.'
  //   );
  //   seachFormRef.reset();
  //   return;
  // }
  // if (response.data.hits.length < 40) {
  //   Notiflix.Notify.info(
  //     "We're sorry, but you've reached the end of search results."
  //   );
  //   seachMore.style.display = 'none';
  // }
  // if (response.data.hits.length >= 40) {
  //   pageNumber += 1;
  //   seachMore.style.display = 'block';
  // }

  createMarkupGallary(response.data.hits);
  // Notiflix.Notify.success(`Hooray! We found ${response.data.total} images.`);
  simpleLightBox.refresh();
}

// функція наступного пошуку
async function onSeachMoreImageClick() {
  const response = await fetchData(seachValue, pageNumber);

  if (response.data.hits.length < 40) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
    seachMore.style.display = 'none';
  }

  createMarkupGallary(response.data.hits);
  // console.log(pageNumber);
  pageNumber += 1;
  // console.log(response.data);
  simpleLightBox.refresh();
}

// функція запиту на бекенд
async function fetchData(query, pageNumber) {
  const API_URL = 'https://pixabay.com/api/';
  // параметри запиту на бекенд
  const options = {
    params: {
      key: '34377092-e5c25fb54909ad5e9d7281441',
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: pageNumber,
      per_page: 40,
    },
  };
  try {
    const response = await axios.get(API_URL, options);
    // console.log(response.data);
    return response;
  } catch (error) {
    console.log(error);
  }
}

// створюємо розмітку галереї
function createMarkupGallary(arryOfImages) {
  const markup = arryOfImages
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a class="gallery-link" href="${largeImageURL}">
        <div class="photo-card">
        <img class="gallery-image" src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
          <p class="info-item">
            <b>Likes</b>${likes}
          </p>
          <p class="info-item">
            <b>Views</b>${views}
          </p>
          <p class="info-item">
            <b>Comments</b>${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>${downloads}
          </p>
        </div>
      </div>
    </a>`;
      }
    )
    .join('');

  galleryRef.insertAdjacentHTML('beforeend', markup);
}

// функція перевірка данних з бекенду
function isCheckedLengthOfArrayImage(response) {
  if (response.data.hits.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    seachFormRef.reset();
    return;
  }
  if (response.data.hits.length < 40) {
    Notiflix.Notify.success(`Hooray! We found ${response.data.total} images.`);
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
    seachMore.style.display = 'none';

    return;
  }
  if (response.data.hits.length >= 40) {
    Notiflix.Notify.success(`Hooray! We found ${response.data.total} images.`);
    pageNumber += 1;
    seachMore.style.display = 'block';
    return;
  }
}

// Intersection Observer - автоматичне завантаження при скролі
const pageObserver = new IntersectionObserver(onBtnSeachMoreObserver);

pageObserver.observe(seachMore);

function onBtnSeachMoreObserver(entities) {
  // деструктуризація масива entities, перший елемент назвем button
  const [button] = entities;
  // якщо кнопка в полі зору зробити дозавантаження данних
  if (button.isIntersecting) {
    console.log('isIntersecting', button.isIntersecting);
    onSeachMoreImageClick();
  }
}
