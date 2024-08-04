const carousel = document.querySelector('.carousel');
const items = document.querySelectorAll('.carousel-item');
const prevButton = document.querySelector('.button.prev');
const nextButton = document.querySelector('.button.next');
const startButton = document.querySelector('.start-game');
const titleScreen = document.querySelector('.title-screen');
let currentIndex = 0;

function updateCarousel() {
    const offset = -currentIndex * 100;
    carousel.style.transform = `translateX(${offset}%)`;
}

prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;
    updateCarousel();
});

nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
    updateCarousel();
});

startButton.addEventListener('click', () => {
    titleScreen.style.display = 'none';
    carousel.style.display = 'flex';
});