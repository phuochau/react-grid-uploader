import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import InlineEdit from 'react-edit-inline';
import { Colors, Fonts } from '../themes';
import Image from './Image';
const ProgressBar = require('react-progressbar.js');
const S3Upload = require('react-s3-uploader/s3upload');

const Circle = ProgressBar.Circle;
const STATUS = {
  WAITING: 'waiting',
  UPLOADING: 'uploading',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const styles = {
  circleContainerStyle: {
    width: '24px',
    height: '24px',
    position: 'absolute',
    bottom: '8px',
    right: '6px',
  },
};

const Container = styled.div`
  position: relative;
  background-color: transparent;
  padding: 10px;
  text-align: center;
  width: 100%;

  &:hover {
    background-color: rgba(0,0,0,0.8);
  }
`;

const Name = styled.p`
  color: white;
  font-size: ${Fonts.size.medium}px;
  margin: 0;
  margin-top: 10px;
  margin-bottom: 0px;
`;

export default class Uploader extends React.Component {
  static propTypes = {
    selected: PropTypes.bool,
    file: PropTypes.object,
    signingUrl: PropTypes.string,
    uploadRequestHeaders: PropTypes.object,
    contentDisposition: PropTypes.string,
    signingUrlMethod: PropTypes.string,
    server: PropTypes.string,
    onDelete: PropTypes.func,
    onZoom: PropTypes.func,
    onSelect: PropTypes.func,
    onUploadError: PropTypes.func,
    onUploadFinish: PropTypes.func,
    onUploadProgress: PropTypes.func,
    onImageRotate: PropTypes.func,
    onDescriptionChange: PropTypes.func,
    customStyle: PropTypes.object,
  }

  static defaultProps = {
    selected: false,
    uploadRequestHeaders: {
      'x-amz-acl': 'public-read',
    },
    contentDisposition: 'auto',
    signingUrlMethod: 'GET',
  }

  constructor(props) {
    super(props);
    this.state = {
      status: STATUS.UPLOADING,
      path: props.file.preview,
      percent: 0,
      description: '',
      s3Data: null,
      error: null,
    };
  }

  componentDidMount() {
    this.startUpload(this.props);
  }

  startUpload = (props) => {
    const {
      file,
      signingUrl,
      signingUrlMethod,
      uploadRequestHeaders,
      contentDisposition,
      server,
    } = props;

    if (file) {
      this.myUploader = new S3Upload({
        files: [file],
        signingUrl,
        server,
        onFinishS3Put: this.onUploadFinish,
        onProgress: this.onUploadProgress,
        onError: this.onUploadError,
        signingUrlMethod,
        uploadRequestHeaders,
        contentDisposition,
      });
    }
  }

  onUploadFinish = (data) => {
    this.setState({
      status: STATUS.COMPLETED,
      percent: 0,
      s3Data: data,
    }, () => {
      if (this.props.onUploadFinish) this.props.onUploadFinish(this.props.file, data);
    });
  }

  onUploadError = (error) => {
    this.setState({
      error,
    }, () => {
      if (this.props.onUploadError) this.props.onUploadError(this.props.file, error);
    });
  }

  onUploadProgress = (progress) => {
    this.setState({ percent: progress }, () => {
      if (this.props.onUploadProgress) this.props.onUploadProgress(this.props.file, progress);
    });
  }

  onDelete = () => {
    if (this.props.onDelete) this.props.onDelete(this.props.file);
  }

  onZoom = () => {
    if (this.props.onZoom) this.props.onZoom(this.props.file);
  }

  onSelect = () => {
    if (this.props.onSelect) this.props.onSelect(this.props.file);
  }

  onRotate = (newRotate) => {
    if (this.props.onImageRotate) this.props.onImageRotate(this.props.file, newRotate);
  }

  onDescriptionChange = (data) => {
    this.setState({ description: data.photoDescription }, () => {
      if (this.props.onDescriptionChange) this.props.onDescriptionChange(this.props.file, data.photoDescription);
    });
  }

  shorternName = (length = 15) => {
    const { file } = this.props;
    if (file.name.length > length) return file.name.substring(0, length) + '...';
    return file.name;
  }

  renderUploading() {
    const { selected, customStyle } = this.props;
    const { path, percent } = this.state;

    const circleOptions = {
      strokeWidth: 48,
      color: customStyle.progressColor || Colors.tertiary,
      trailColor: Colors.disabledBlack,
    };

    return (
        <Container>
          <Image selected={selected} src={path} customStyle={customStyle}>
            <Circle progress={percent * 0.01}
              options={circleOptions}
              initialAnimate={true}
              containerStyle={styles.circleContainerStyle}
              containerClassName={'.progressbar'} />
          </Image>
          <Name style={customStyle.nameStyle}>{this.shorternName()}</Name>
        </Container>
    );
  }

  renderComplete() {
    const { selected, customStyle } = this.props;
    const { path, description } = this.state;
    return (
      <Container onClick={this.onSelect}>
        <Image selected={selected} src={path} onDelete={this.onDelete} onZoom={this.onZoom}
          onRotate={this.onRotate} customStyle={customStyle} />
        <Name style={customStyle.nameStyle}>{this.shorternName()}</Name>
        <InlineEdit style={customStyle.descriptionStyle} text={description}
          placeholder="Add description"
          paramName="photoDescription"
          change={this.onDescriptionChange}/>
      </Container>
    );
  }

  render() {
    const { status } = this.state;
    if (status === STATUS.WAITING) return this.renderWaiting();
    else if (status === STATUS.COMPLETED) return this.renderComplete();
    else if (status === STATUS.UPLOADING) return this.renderUploading();
  }
}
