import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Stage, Layer, Rect, Group, Text } from 'react-konva';

export default class TemplateDisplay extends Component {
  constructor(props) {
    super(props);

    this.groups = [];
    this.stopUpdateRender = false;
    this.onMoveUpdateCounter = 0;

    this.state = {
      width: 0,
      height: 0
    };
  }

  componentDidMount() {
    const { clientWidth, clientHeight } = document.getElementById("template-display");
    let length = clientWidth > clientHeight ? clientHeight : clientWidth;
    length = Math.floor(length * .8);
    this.setState({
      width: length,
      height: length
    })
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !this.stopUpdateRender;
  }

  genTranslate(group) {
    const { width, height } = this.state;
    let { x, y } = group.absolutePosition();
    x = x - group.offset().x * group.scaleX();
    y = y - group.offset().y * group.scaleY();
    const translateX = x / width;
    const translateY = y / height;
    return {
      x: translateX.toPrecision(2),
      y: translateY.toPrecision(2)
    }
  }

  onDragMove = (group, template) => {
    const { onTranslateChange } = this.props;
    if(this.onMoveUpdateCounter++ % 5 === 0) {
      onTranslateChange(template.id, this.genTranslate(group));
    }
  };

  onDragEnd = (group, template) => {
    const { onTranslateChange } = this.props;
    this.stopUpdateRender = false;
    onTranslateChange(template.id, this.genTranslate(group));
  };

  onDragStart = (group, template) => {
    this.stopUpdateRender = true;
  };

  assignGroupRef = (ref, idx) => {
    const { templates } = this.props;

    if(!ref)
      return;

    if (!this.groups[idx]) {
      this.groups.push(null);
    }
    this.groups[idx] = ref;

    ref.off('dragmove');
    ref.on('dragmove', e => this.onDragMove(e.target, templates[idx]));

    ref.off('dragend');
    ref.on('dragend', e => this.onDragEnd(e.target, templates[idx]));

    ref.off('dragstart');
    ref.off('dragstart', e => this.onDragStart(e.target, templates[idx]));
  };

  render() {
    const { width, height } = this.state;
    const { templates } = this.props;

    return (
      <div id="template-display" className="template-display">
        <Stage className="stage" width={width} height={height} ref={ref => this.stage=ref}>
          <Layer>
            { templates.map( (template, idx) => {
              const { scale, translate, rotate, flip, id } = template;
              const x = width * scale.x / 2 + width * translate.x;
              const y = height * scale.y / 2 + height * translate.y;
              return (
                <Group
                  key={id}
                  ref={ref => this.assignGroupRef(ref, idx)}
                  width={width}
                  height={height}
                  x={x}
                  y={y}
                  scaleX={flip? -scale.x : scale.x}
                  scaleY={scale.y}
                  rotation={rotate}
                  offsetX={width/2}
                  offsetY={height/2}
                  draggable={true}
                >
                  <Rect
                    width={width}
                    height={height}
                    fill={"rgba(250, 229, 211, 0.5)"}
                    strokeWidth={1}
                    stroke="darkgrey"
                  />
                  <Text
                    text={id}
                    width={width}
                    height={height}
                    fontSize={200}
                    fill={"rgba(0, 0, 0, 0.5)"}
                    align="center"
                    verticalAlign="middle"
                    fontFamily="calibri"
                    />
                </Group>
              );
            }) }
          </Layer>
        </Stage>
      </div>
    );
  }
}

TemplateDisplay.propTypes = {
  templates: PropTypes.array,
  onTranslateChange: PropTypes.func
};