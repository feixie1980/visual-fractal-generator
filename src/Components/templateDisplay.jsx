import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Stage, Layer, Rect, Group, Text, Transformer } from 'react-konva';

import styles from './templateDisplay.scss';

/**
 * Bring selected template to the front of the canvas by moving it ot the last of the templates
 * @param templates
 * @param selectedTemplate
 */
function reorderTemplates(templates, selectedTemplate) {
  if(!selectedTemplate) {
    return templates;
  }

  const reordered = [...templates];
  const idx = reordered.findIndex(template => template.id === selectedTemplate.id);
  const removed = reordered.splice(idx, 1);
  reordered.push(removed[0]);
  return reordered;
}


function RectGroup(props) {
  const { template, width, height,
    isSelected, onSelect,
    onDragStart, onDragEnd, onDragMove,
    onTransformStart, onTransform, onTransformEnd } = props;

  const { scale, translate, rotate, flip, id } = template;
  const x = width * scale.x / 2 + width * translate.x;
  const y = height * scale.y / 2 + height * translate.y;
  const groupRef = React.useRef();
  const transformerRef = React.useRef();

  React.useEffect(() => {
    if(transformerRef.current){
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  });

  return (
    <>
      <Group
        ref={groupRef}
        width={width}
        height={height}
        x={x}
        y={y}
        scaleX={flip? -scale.x : scale.x}
        scaleY={scale.y}
        rotation={rotate}
        offsetX={width/2}
        offsetY={height/2}
        onClick={() => onSelect(template)}
        draggable={true}
        onDragStart={e => onDragStart(e.target, template)}
        onDragEnd={e => onDragEnd(e.target, template)}
        onDragMove={e => onDragMove(e.target, template)}
        onTransformStart={e => onTransformStart(e.target, template)}
        onTransform={e => onTransform(e.target, template)}
        onTransformEnd={e => onTransformEnd(e.target, template)}
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
      {
        isSelected && (
          <Transformer
            ref={transformerRef}
          />
        )}
    </>
  );
}

export default class TemplateDisplay extends Component {
  constructor(props) {
    super(props);

    this.stopUpdateRender = false;
    this.onTransformUpdateCounter = 0;

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
      height: length,
      selectedTemplate: null
    })
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !this.stopUpdateRender;
  }

  extractTranslate(group) {
    const { width, height } = this.state;
    let { x, y } = group.absolutePosition();
    x = x - group.offset().x * group.scaleX();
    y = y - group.offset().y * group.scaleY();
    const translateX = x / width;
    const translateY = y / height;
    return {
      x: parseFloat(translateX.toPrecision(2)),
      y: parseFloat(translateY.toPrecision(2))
    }
  }

  extractScaleRotate(group) {
    const scaleFromGroup = group.scale();
    return {
      scale: {
        x: parseFloat(scaleFromGroup.x.toPrecision(2)),
        y: parseFloat(scaleFromGroup.y.toPrecision(2))
      },
      rotate: parseFloat(group.rotation().toPrecision(2))
    };
  }

  onDragMove = (group, template) => {
    const { onTransformsChange } = this.props;
    if (this.onTransformUpdateCounter++ % 5 === 0) {
      onTransformsChange(template.id, { translate: this.extractTranslate(group) });
    }
  };

  onDragEnd = (group, template) => {
    const { onTransformsChange } = this.props;
    this.stopUpdateRender = false;
    onTransformsChange(template.id, { translate: this.extractTranslate(group) });
  };

  onDragStart = () => {
    this.stopUpdateRender = true;
  };

  onTransformStart = () => {
    this.stopUpdateRender = true;
  };

  onTransform = (group, template) => {
    const { onTransformsChange } = this.props;
    if(this.onTransformUpdateCounter++ % 5 === 0) {
      onTransformsChange(template.id, this.extractScaleRotate(group));
    }
  };

  onTransformEnd = (group, template) => {
    const { onTransformsChange } = this.props;
    onTransformsChange(template.id, this.extractScaleRotate(group));
    this.stopUpdateRender = false;
  };

  onSelect = (template) => {
    this.setState({
      selectedTemplate: template
    })
  };

  detectDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      this.onSelect(null);
    }
  };

  render() {
    const { width, height, selectedTemplate } = this.state;
    const { templates } = this.props;
    let reordered = reorderTemplates(templates, selectedTemplate);
    return (
      <div id="template-display" className={styles.templateDisplay}>
        <Stage className={styles.stage} width={width} height={height} onMouseDown={this.detectDeselect}>
          <Layer>
            { reordered.map( template => {
                const isSelected = !!selectedTemplate && template.id === selectedTemplate.id;
                return <RectGroup
                  key={template.id}
                  template={template}
                  width={width}
                  height={height}
                  isSelected={isSelected}
                  onSelect={this.onSelect}
                  onDragStart={this.onDragStart}
                  onDragEnd={this.onDragEnd}
                  onDragMove={this.onDragMove}
                  onTransformStart={this.onTransformStart}
                  onTransform={this.onTransform}
                  onTransformEnd={this.onTransformEnd}
                />;
              })
            }
          </Layer>
        </Stage>
      </div>
    );
  }
}

TemplateDisplay.propTypes = {
  templates: PropTypes.array,
  onTransformsChange: PropTypes.func
};