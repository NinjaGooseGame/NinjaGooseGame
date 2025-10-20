function showSlide(index) {
  const track = document.querySelector('.gallery-track');
  const slideWidth = track.children[0].offsetWidth;
  track.parentElement.scrollTo({
    left: index * slideWidth,
    behavior: 'smooth'
  });
}
