import React from "react";
import PropTypes from "prop-types";
import { IKContext, IKImage } from "imagekitio-react";

const ImageKit = ({ imgSrc }) => {
  return (
    <IKContext
      publicKey="public_rAL1UY0DlTR2TIxVqm13cTYADbc="
      urlEndpoint="https://ik.imagekit.io/usam13ogl7u"
    >
      <IKImage
        src={imgSrc}
        transformation={[
          {
            quality: 10,
          },
        ]}
      />
    </IKContext>
  );
};

ImageKit.propTypes = {};

export default ImageKit;
