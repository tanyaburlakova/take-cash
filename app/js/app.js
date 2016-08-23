$(() => {
    $('.jsGallery').slick({
        swipe: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true,
        autoplay: true,
        autoplaySpeed: 5000,
        nextArrow: $('.jsGalleryBtnNext'),
        prevArrow: $('.jsGalleryBtnPrev')
    });

    $('.jsGalleryDotts').slick({
    	arrows: false,
    	dots: true,
    	autoplay: true,
        autoplaySpeed: 5000
    });
    $('.jsReviewsSlider').slick({
        arrows: false,
        swipe: false,
        autoplay: true,
        autoplaySpeed: 5000
    });
});
