import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'reflexbox';
import Dropzone from 'react-dropzone';
import Lightbox from 'react-image-lightbox';
import { Colors, Fonts } from '../themes';
import { Uploader } from './index';
import { Utilities } from '../lib';

export default class GridContainer extends React.Component {
  static propTypes = {
    customStyle: PropTypes.object,
    signingUrl: PropTypes.string,
    onUploadFinish: PropTypes.func,
    onUploadError: PropTypes.func,
    onUploadProgress: PropTypes.func,
    onItemSelect: PropTypes.func,
    onItemDelete: PropTypes.func,
  }

  static defaultProps = {
    customStyle: {
      containerStyle: { width: '100%', backgroundColor: Colors.info, minHeight: '600px' },
      nameStyle: null,
      descriptionStyle: { color: Colors.placeholder, margin: 0, fontSize: Fonts.size.small },
      imageBorderColor: Colors.disabled,
      imageBorderActiveColor: Colors.red,
      iconContainerStyle: null,
      iconStyle: null,
      progressColor: Colors.tertiary,
    },
  }

  constructor(props) {
    super(props);
    this.state = {
      files: [],
      photoIndex: 0,
      selectedFileId: null,
      lightBoxOpen: false,
    };
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    this.addFiles(acceptedFiles);
  }

  onDelete = (deletingFile, raiseCallback = true) => {
    this.setState({ files: this.state.files.filter(file => file.id !== deletingFile.id) }, () => {
      if (raiseCallback && this.props.onItemDelete) this.props.onItemDelete(deletingFile);
    });
  }

  onSelect = (file) => {
    const { selectedFileId } = this.state;
    const newId = file.id;
    if (selectedFileId === newId) this.setState({ selectedFileId: null });
    else this.setState({ selectedFileId: newId }, () => {
      if (this.props.onItemSelect) this.props.onItemSelect(file);
    });
  }

  onUploadError = (file, error) => {
    if (this.props.onUploadError) this.props.onUploadError(file, error);
    this.onDelete(file, false);
  }

  onUploadFinish = (file, s3Data) => {
    const { files } = this.state;
    const newFiles = [...files];
    const fileIndex = this.findFileIndex(file);
    if (fileIndex > -1) newFiles[fileIndex].s3Data = s3Data;

    this.setState({ files: newFiles }, () => {
      if (this.props.onUploadFinish) this.props.onUploadFinish(file, s3Data);
    });
  }

  onItemRotate = (file, rotateDegree) => {
    const { files } = this.state;
    const newFiles = [...files];
    const fileIndex = this.findFileIndex(file);
    if (fileIndex > -1) newFiles[fileIndex].rotate = rotateDegree;
    this.setState({ files: newFiles });
  }

  onDescriptionChange = (file, description) => {
    const { files } = this.state;
    const newFiles = [...files];
    const fileIndex = this.findFileIndex(file);
    if (fileIndex > -1) newFiles[fileIndex].description = description;
    this.setState({ files: newFiles });
  }

  findFileIndex = (file) => {
    const { files } = this.state;
    for (let i = 0; i < files.length; i++) {
      if (files[i].id === file.id) return i;
    }
    return -1;
  }

  getData() {
    return this.state.files;
  }

  addFiles = (files) => {
    let newFiles = this.state.files.slice();
    files.forEach(file => {
      file.id = Utilities.uniqueId();
      file.rotate = 0;
      newFiles.unshift(file);
    });
    this.setState({ files: newFiles });
  }

  // ligh box
  openLightBox = (file) => {
    const { files } = this.state;
    if (files.length === 0) return '';
    this.setState({ lightBoxOpen: true, photoIndex: files.indexOf(file) });
  }

  closeLightBox = () => {
    this.setState({ lightBoxOpen: false });
  }

  imageSource = (index) => {
    const { files } = this.state;
    if (files.length === 0) return '';

    let imageIndex = index;
    if (imageIndex < 0) imageIndex = 0;
    if (imageIndex > files.length - 1) imageIndex = files.length - 1;

    return files[imageIndex].path || files[imageIndex].preview;
  }

  nextPhoto = () => {
    const { files, photoIndex } = this.state;
    let nextPhotoIndex = photoIndex + 1;
    if (nextPhotoIndex > files.length - 1) nextPhotoIndex = 0;

    this.setState({ photoIndex: nextPhotoIndex });
  }

  prevPhoto = () => {
    const { files, photoIndex } = this.state;
    let prevPhotoIndex = photoIndex - 1;
    if (prevPhotoIndex < 0) prevPhotoIndex = files.length - 1;

    this.setState({ photoIndex: prevPhotoIndex });
  }

  renderLightBox = () => {
    const { files, lightBoxOpen, photoIndex } = this.state;
    if (files.length === 0 || !lightBoxOpen) return '';
    return (
      <Lightbox
        mainSrc={this.imageSource(photoIndex)}
        nextSrc={this.imageSource(photoIndex + 1)}
        prevSrc={this.imageSource(photoIndex - 1)}
        onMovePrevRequest={this.prevPhoto}
        onMoveNextRequest={this.nextPhoto}
        onCloseRequest={this.closeLightBox}
      />
    );
  }

  render() {
    const {
      signingUrl,
      onUploadProgress,
      customStyle,
    } = this.props;
    const { files, selectedFileId } = this.state;
    const { baseUrl, uri } = Utilities.extractDomain(signingUrl);
    return (
      <Dropzone onDrop={this.onDrop} style={customStyle.containerStyle} disableClick>
        <Flex flexRow wrap>
          {files.map(file =>
            <Box key={file.id} col={3}>
              <Uploader file={file} server={baseUrl} signingUrl={uri}
                onDelete={this.onDelete} onZoom={this.openLightBox} onSelect={this.onSelect} selected={file.id === selectedFileId}
                onUploadFinish={this.onUploadFinish}
                onUploadError={this.onUploadError}
                onUploadProgress={onUploadProgress}
                onImageRotate={this.onItemRotate}
                onDescriptionChange={this.onDescriptionChange}
                customStyle={customStyle} />
            </Box>)
          }
        </Flex>
        {this.renderLightBox()}
      </Dropzone>
    );
  }
}
