import React, { useState } from 'react';
import { Form, Card, Row, Col, Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faPaintBrush } from "@fortawesome/free-solid-svg-icons";

export default function Editor(props) {
  const { templates, onNameChange, onScaleChange, onTranslateChange, onRotateChange, onFlipChange, onRemove, onAdd } = props;
  return (
    <div className="editor container">
      <div className="editor-control">
        <Button variant="link" size="sm" onClick={onAdd}>
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>
      {templates.map(template => {
        const { id, name, scale, translate, rotate, flip } = template;
        return (
          <Card className="template-card" key={id}>
            <Card.Body className="template-card-body">
              <Card.Title>
                <div className="template-card-title">
                  <Form><Form.Text>Name</Form.Text>
                    <Form.Control type="text" defaultValue={name} size="sm"
                                  onBlur={ e => onNameChange(id, e.target.value)}/>
                  </Form>
                  <Button className="btn-card-remove" variant="link" size="sm" onClick={() => onRemove(id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>

              </Card.Title>
              <Form>
                <Form.Group>

                      <Form.Text>Scale</Form.Text>
                      <Row>
                        <Col>
                          <Form.Text muted>width</Form.Text>
                          <Form.Control step="0.01" min="0" max="1" type="number" defaultValue={scale.x} size="sm"
                                        onChange={ e => onScaleChange(id, {x: parseFloat(e.target.value), y: scale.y})}/>
                        </Col>
                        <Col>
                          <Form.Text muted>height</Form.Text>
                          <Form.Control step="0.01" min="0" max="1" type="number" defaultValue={scale.y} size="sm"
                                        onChange={ e => onScaleChange(id, {x: scale.x, y: parseFloat(e.target.value)})}/>
                        </Col>
                      </Row>
                      <Form.Text>Translate</Form.Text>
                      <Row>
                        <Col>
                          <Form.Text muted>x</Form.Text>
                          <Form.Control step="0.01" min="0" max="1" type="number" value={translate.x} size="sm"
                                        onChange={ e => onTranslateChange(id, {x: parseFloat(e.target.value), y: translate.y})}/>
                        </Col>
                        <Col>
                          <Form.Text muted>y</Form.Text>
                          <Form.Control step="0.01" min="0" max="1" type="number" value={translate.y} size="sm"
                                        onChange={ e => onTranslateChange(id, {x: translate.x, y: parseFloat(e.target.value)})}/>
                        </Col>
                      </Row>

                </Form.Group>
                <Form.Group>
                  <Form.Text>Rotate & Flip</Form.Text>
                  <Row>
                    <Col sm={10}>
                      <Form.Text muted>angle in degree</Form.Text>
                      <Form.Control type="number" defaultValue={rotate} size="sm"
                                    onChange={ e => onRotateChange(id, parseFloat(e.target.value))}/>
                    </Col>
                    <Col sm={2}>
                      <Form.Text muted>flip</Form.Text>
                      <Form.Check type="checkbox" defaultValue={flip} size="sm"
                                    onChange={ e => onFlipChange(id, e.target.checked) } />
                    </Col>
                  </Row>
                </Form.Group>

              </Form>
            </Card.Body>
          </Card>
        );
      }
      )}
    </div>
  );
}