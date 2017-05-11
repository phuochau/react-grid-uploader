import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withReflex } from 'reflexbox';
import IconButton from './IconButton';
import { Utilities } from '../lib';

const styles = {
  icon: {
    color: 'white',
    fontSize: '12px',
  }
};

const Container = styled.div`
  max-width: 60%;
  height: 120px;
  position: relative;
  margin: auto;
  border-width: 4px;
  border-style: solid;
  border-color: ${props => { return props.selected ? props.borderActiveColor : props.borderColor; }};
  display: -webkit-box;      /* OLD - iOS 6-, Safari 3.1-6 */
  display: -moz-box;         /* OLD - Firefox 19- (buggy but mostly works) */
  display: -ms-flexbox;      /* TWEENER - IE 10 */
  display: -webkit-flex;     /* NEW - Chrome */
  display: flex;
  align-items: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  justify-content: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  -webkit-justify-content: center;

  & .controls {
    display: none;
  }

  &:hover {
    border-color: ${props => props.borderActiveColor};
  }

  &:hover .controls {
    display: block;
  }
`;

const Image = styled.img`
  -ms-transform: rotate(${props => props.rotate || 0}deg); /* IE 9 */
  -webkit-transform: rotate(${props => props.rotate || 0}deg); /* Chrome, Safari, Opera */
  transform: rotate(${props => props.rotate || 0}deg);
  width: ${props => props.width ? `${props.width}px` : 'auto'};
  height: ${props => props.height ? `${props.height}px` : 'auto'};
  max-width: ${props => !props.width ? '100%' : 'none'};
  max-height: ${props => !props.height ? '100%' : 'none'};
`;

const BaseIconButton = styled.div`
  position: absolute;
  background-color: rgba(0,0,0,0.8);
  width: 22px;
  height: 22px;
  border-radius: 3px;
  border: 2px solid rgba(255,255,255,0.3);
  cursor: pointer;
`;

const ZoomIconButton = withReflex()(styled(BaseIconButton)`
  left: 0;
  bottom: 0;
`);

const RotateIconButton = withReflex()(styled(BaseIconButton)`
  right: 0;
  bottom: 0;
`);

const CloseIconButton = withReflex()(styled(BaseIconButton)`
  top: -12px;
  right: -12px;
  border-radius: 10px;
`);

export default class ImageExt extends React.Component {
  static propTypes = {
    hideControls: PropTypes.bool,
    onDelete: PropTypes.func,
    onZoom: PropTypes.func,
    onRotate: PropTypes.func,
    selected: PropTypes.bool,
  }

  static defaultProps = {
    hideControls: false,
    selected: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      rotate: 0,
      thumbnailWidth: null,
      thumbnailHeight: null,
      containerId: Utilities.uniqueId(),
    };
  }

  onLoad = ({ target: img }) => {
    this.setState({
      thumbnailWidth: img.offsetWidth,
      thumbnailHeight: img.offsetHeight,
    });
  }

  onRotate = () => {
    let newRotate = this.state.rotate + 90;
    if (newRotate === 360) newRotate = 0;
    this.setState({ rotate: newRotate }, () => {
      if (this.props.onRotate) this.props.onRotate(newRotate);
    });
  }

  getDimension = () => {
    const { rotate, thumbnailWidth, thumbnailHeight } = this.state;
    const container = document.getElementById(this.containerId());
    if (!container || !thumbnailWidth || !thumbnailHeight) return { width: null, height: null };

    const clientWidth = container.clientWidth;
    const clientHeight = container.clientHeight;

    const ratio = thumbnailWidth / thumbnailHeight;

    if (rotate % 180 > 0) {
      let height = clientWidth;
      let width = ratio * height;
      if (width > clientHeight) {
        width = clientHeight;
        height = width / ratio;
      }
      return { width, height };
    } else {
      let height = clientHeight;
      let width = clientHeight * ratio;
      if (width > clientWidth) {
        width = clientWidth;
        height = width / ratio;
      }
      return { width, height };
    }
  }

  containerId = () => {
    const { containerId } = this.state;
    return `img_${containerId}`;
  }

  render() {
    const { src, hideControls, onDelete, onZoom, selected, customStyle } = this.props;
    const { rotate } = this.state;
    const { width, height } = this.getDimension();
    return (
      <Container borderColor={customStyle.imageBorderColor} borderActiveColor={customStyle.imageBorderActiveColor}
        id={this.containerId()} selected={selected}>
        <Image src={src} rotate={rotate} onLoad={this.onLoad}
          width={width} height={height} />
        {
          !hideControls &&
          <div className="controls">
            <ZoomIconButton style={customStyle.iconContainerStyle} onClick={onZoom} flex align="center">
              <IconButton iconProps={{ name: 'search', style: customStyle.iconStyle || styles.icon }} />
            </ZoomIconButton>
            <RotateIconButton style={customStyle.iconContainerStyle} onClick={this.onRotate} flex align="center">
              <IconButton style={customStyle.iconStyle} iconProps={{ name: 'repeat', style: customStyle.iconStyle || styles.icon }} />
            </RotateIconButton>
            <CloseIconButton style={customStyle.iconContainerStyle} onClick={onDelete} flex align="center">
              <IconButton style={customStyle.iconStyle} iconProps={{ name: 'times', style: customStyle.iconStyle || styles.icon }} />
            </CloseIconButton>
          </div>
        }
        {this.props.children}
      </Container>
    );
  }
}
