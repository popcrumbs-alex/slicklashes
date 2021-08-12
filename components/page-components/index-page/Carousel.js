import React, { useState, useEffect, createRef, useRef } from "react";
import PropTypes from "prop-types";
import style from "./Carousel.module.scss";
import { ChevronLeft, ChevronRight } from "react-feather";
import LoadingSpinner from "../loading/LoadingSpinner";
import { Alert } from "../../reusable/alerts/Alert";
import ReactPlayer from "react-player";
import ImageKit from "../../reusable/images/ImageKit";

//TODO fix change index on swipe
const Carousel = ({ foundItem }) => {
  const imageRef = createRef();
  const imgContainerRef = useRef();
  const [currentIndex, setIndex] = useState(1);
  const [imageWidth, setImageWidth] = useState(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [images, setImages] = useState([]);
  const [max, setMax] = useState(0);
  const [shifting, setShifting] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [imgGridColumns, setImgGridColumns] = useState("");
  const [imgGridRows, setImgGridRows] = useState("");

  const addedVideoData = [
    {
      src: "https://www.youtube.com/watch?v=eOQFgzHw--0",
      type: "video",
    },
    {
      src: "https://www.youtube.com/watch?v=fyA5r4RNuZw",
      type: "video",
    },
  ];
  //value to select image to add to array
  let timeID;
  //load images and set boundary image to first index
  useEffect(() => {
    if (foundItem) {
      //inject the video

      setImages([
        foundItem.images[foundItem.images.length - 1],
        ...foundItem.images,
        ...addedVideoData,
        foundItem.images[0],
      ]);
    }
  }, [foundItem]);

  useEffect(() => {
    setMax(images.length - 1);
  }, [images]);

  //set initial image width
  useEffect(() => {
    if (imageRef.current && imageWidth === null)
      setImageWidth(imageRef.current.offsetWidth);
  }, [imageRef.current, imageWidth]);

  // once image width has updated, update the scrollwidth
  useEffect(() => {
    if (imageWidth) setScrollWidth(-imageWidth);
  }, [imageWidth]);

  //Resizing window handle
  useEffect(() => {
    const handleResize = () => {
      clearInterval(timeID);

      if (imageRef.current !== null)
        setImageWidth(imageRef.current.offsetWidth);
      if (imgContainerRef.current !== null) setScrollWidth(-imageWidth);
    };

    window.addEventListener("resize", () => handleResize());

    return () => window.removeEventListener("resize", () => handleResize());
  }, [imageRef, imgContainerRef]);

  const handleIndexChange = (val) => {
    // Val will either be 1 or null
    //clear interval on manual index change
    clearInterval(timeID);
    //if slide is in transition, disable index change in order to prevent transitionend from not being triggered
    if (shifting) return;
    //appear to be moving right
    if (val) {
      //set state of slide to be transitioning
      setShifting(true);
      //activate transition
      imgContainerRef.current.style.transition = "all 0.5s ease";
      //index determines where in sequence
      setIndex((prevState) => prevState + 1);
      //scroll width determines size of slide
      setScrollWidth((prevWidth) => prevWidth - imageRef.current.offsetWidth);
    }

    //appear to be moving left
    if (!val) {
      //set state of slide to be transitioning
      setShifting(true);
      //activate transition
      imgContainerRef.current.style.transition = "all 0.5s ease";
      //index determines where in sequence
      setIndex((prevState) => prevState - 1);
      //scroll width determines size of slide
      setScrollWidth((prevState) => prevState + imageWidth);
    }
  };

  //update scroll point on index change
  const handleScroll = () => {
    imgContainerRef.current.style.transform = `translate3d(${scrollWidth}px, 0,0)`;
  };

  useEffect(() => {
    if (imageRef.current && imgContainerRef.current) {
      handleScroll();
    }
  }, [currentIndex, imgContainerRef, imageRef]);

  const endTransition = () => {
    //once transition is complete allow for next slide
    setShifting(false);
    imgContainerRef.current.style.transition = "all 0s ease";

    if (currentIndex >= max) {
      console.log("MAXREACH", currentIndex);
      setScrollWidth(-(1 * imageWidth));
      setIndex(1);
    }
    if (currentIndex <= 0) {
      setScrollWidth(-(imageWidth * images.length));
      setIndex(images.length - 1);
    }
  };

  const calculateImgGridColumns = (imgs) => {
    //recalc to remove the two added fake imgs
    const imgLength = imgs.length - 2;
    let imgString = `repeat(${imgLength}, minmax(${imageWidth / imgLength}px,${
      imageWidth / imgLength
    }px)`;
    if (imgLength > 4) {
      imgString = `repeat(${imgLength / 2}, minmax(${
        imageWidth / imgLength
      }px,${imageWidth / imgLength}px)`;
    }
    console.log("imgs loaded so far!", imgs, imageWidth);
    setImgGridColumns(imgString);
  };

  const calculateImgGridRows = (imgs) => {
    //recalc to remove the two added fake imgs
    const imgLength = imgs.length - 2;
    let imgString = `1fr`;
    if (imgLength > 4) {
      imgString = `repeat(2,auto)`;
    }
    console.log("imgs loaded so far!", imgs, imageWidth);
    setImgGridRows(imgString);
  };

  //calculate the grid size for the image grid
  useEffect(() => {
    if (foundItem && images.length > 0) {
      calculateImgGridColumns(images);
    }
  }, [foundItem, images]);

  //calculate number of rows for amount of imgs in grid
  useEffect(() => {
    if (foundItem && images.length > 0) {
      calculateImgGridRows(images);
    }
  }, [foundItem, images]);

  if (!foundItem) {
    return (
      <div className={style.carousel}>
        <LoadingSpinner />
      </div>
    );
  }

  if (foundItem && foundItem.images.length === 0) {
    return (
      <div className={style.carousel}>
        <Alert
          status={"danger"}
          msg={"Please add images to your product in shopify"}
        ></Alert>
      </div>
    );
  }

  console.log("imageWidth!", imageWidth);
  //this can only render if there are images
  const imgs = images.map((obj, i) =>
    obj.type !== "video" ? (
      <ImageKit imgSrc={obj.src} alt={foundItem.title} key={i} />
    ) : (
      <ReactPlayer url={obj.src} width={"100%"} height={"auto"} key={i} />
    )
  );

  return (
    <>
      <div className={`${style.carousel} ${style.carousel_mobile}`}>
        <div className={style.back}>
          <button onClick={() => handleIndexChange(null)}>
            <ChevronLeft size={40} />
          </button>
        </div>
        <div
          className={style.imgs_container}
          ref={imageRef}
          onPointerEnter={(e) => setHovering(true)}
          onPointerLeave={(e) => setHovering(false)}
        >
          <div
            className={style.inner_container}
            ref={imgContainerRef}
            style={{
              gridTemplateColumns: `repeat(${images.length}, 100%)`,
            }}
            onTransitionEnd={(e) => endTransition()}
          >
            {imgs}
          </div>
        </div>
        <div className={style.next}>
          <button onClick={() => handleIndexChange(1)}>
            <ChevronRight size={40} />
          </button>
        </div>
      </div>
      <div
        className={style.img_grid}
        style={{
          gridTemplateColumns: imgGridColumns.toString(),
          gridTemplateRows: imgGridRows.toString(),
        }}
      >
        {imgs.slice(1, max)}
      </div>
    </>
  );
};

Carousel.propTypes = {
  foundItem: PropTypes.object,
};

export default Carousel;
