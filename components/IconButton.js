import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import FontAwesome from 'react-fontawesome';

const Button = styled.a`
  margin: auto;
  background-color: transparent;
`;

export default class IconButton extends React.Component {
  static propTypes = {
    iconProps: PropTypes.object,
    style: PropTypes.object,
  }

  static defaultProps = {
    iconProps: {}
  }

  render() {
    const { iconProps } = this.props;
    return (
      <Button>
        <FontAwesome {...iconProps} />
      </Button>
    );
  }
}
