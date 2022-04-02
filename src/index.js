import './css/common.css';
import ImagesApiService from './images-api-service';
import LoadMoreBtn from './loadMoreBtn';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  serarchForm: document.querySelector('#search-form'),
  galleryContainer: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const imagesApiService = new ImagesApiService();
const loadMoreBtn = new LoadMoreBtn({ selector: '.load-more', hidden: true });

refs.serarchForm.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', fetchImages);

function onSearch(e) {
  e.preventDefault();

  imagesApiService.query = e.currentTarget.elements.searchQuery.value;

  if (imagesApiService.query === '') {
    return Notify.failure('Search field must not be empty!');
  }

  clearImageContainer();
  imagesApiService.resetPage();
  loadMoreBtn.hide();
  fetchImages();
}

async function fetchImages() {
  try {
    const { hits, totalHits } = await imagesApiService.fetchImages();
    if (totalHits === 0)
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
      );
    appendImagesMarkup(hits);
    loadMoreBtn.show();
    Notify.success(`Hooray! We found ${totalHits} images.`);
  } catch (error) {
    console.log(error.massage);
  }
}

function appendImagesMarkup(hits) {
  const markup = hits
    .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
      return `<div class="photo-card">
  <a class="image-card__link" href=${largeImageURL}>
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes: </b>${likes}
    </p>
    <p class="info-item">
      <b>Views: </b>${views}
    </p>
    <p class="info-item">
      <b>Comments: </b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads: </b>${downloads}
    </p>
  </div>
  </a>
</div>`;
    })
    .join('');

  refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh('show.simpleLightbox');
}

function clearImageContainer() {
  refs.galleryContainer.innerHTML = '';
}

const lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionsDelay: 250 });
