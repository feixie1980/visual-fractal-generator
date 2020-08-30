import React, { Component, useState } from 'react';
import { Button, Navbar, Form, Tabs, Tab } from 'react-bootstrap';
import Editor from 'Components/templateEditor.jsx';
import TemplateDisplay from 'Components/templateDisplay.jsx';
import FractalDisplay from "Components/fractalDisplay.jsx";
import FileSaver from 'file-saver';
import * as math from 'mathjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from "@fortawesome/free-solid-svg-icons";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'styles/app.scss'

const testTemplates = [
  {
    "id": "3",
    "name": "template3",
    "colorIndex": 2,
    "scale": {
      "x": 0.5,
      "y": 0.5
    },
    "translate": {
      "x": 0,
      "y": 0.5
    },
    "rotate": 0,
    "flip": false
  },
  {
    "id": "2",
    "name": "template2",
    "colorIndex": 1,
    "scale": {
      "x": 0.5,
      "y": 0.5
    },
    "translate": {
      "x": 0.5,
      "y": 0
    },
    "rotate": 0,
    "flip": false
  },
  {
    "id": "1",
    "name": "template1",
    "colorIndex": 0,
    "scale": {
      "x": 0.5,
      "y": 0.5
    },
    "translate": {
      "x": 0,
      "y": 0
    },
    "rotate": 0,
    "flip": false
  }
];

function addNewTo(templates) {
  const { id, name } = getNewIdName(templates);
  let newTemplates = [...templates];
  const newTemplate = {
    id, name, colorIndex: id-1,
    scale: { x: 0.5, y: 0.5 },
    translate: { x: 0, y: 0 },
    rotate: 0
  };
  newTemplates.splice(0, 0, newTemplate);
  return newTemplates;
}

let curIndex = 0;
function getNewIdName(templates) {
  let name = null, id = null;
  while (true) {
    curIndex++;
    name = `template${curIndex}`;
    id = `${curIndex}`;
    if (templates.findIndex(t => t.name === name) === -1 && templates.findIndex(t => t.id === id) === -1) {
      break;
    }
  }
  return {id, name};
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      templates: testTemplates,//addNewTo([]),
      loadedFile: null,
      activeKey: 'editor'
    }
  }

  updateName = (id, newName) => {
    let newTemplates = [...this.state.templates];
    if(!!newTemplates.find(t => t.name === newName)) {
      alert(`Warning: a template with the name "${newName}" already exists.`);
    }
    newTemplates.find(t => t.id === id).name = newName;
    this.setState({templates: newTemplates});
  };

  updateScale = (id, newScale) => {
    let newTemplates = [...this.state.templates];
    newTemplates.find(t => t.id === id).scale = newScale;
    this.setState({templates: newTemplates});
  };

  updateTranslate = (id, newTranslate) => {
    let newTemplates = [...this.state.templates];
    newTemplates.find(t => t.id === id).translate = newTranslate;
    this.setState({templates: newTemplates});
  };

  updateRotate = (id, newAngle) => {
    let newTemplates = [...this.state.templates];
    newTemplates.find(t => t.id === id).rotate = newAngle;
    this.setState({templates: newTemplates});
  };

  updateFlipe = (id, flipValue) => {
    let newTemplates = [...this.state.templates];
    newTemplates.find(t => t.id === id).flip = flipValue;
    this.setState({templates: newTemplates});
  };

  addTemplate = () => {
    let newTemplates = addNewTo(this.state.templates);
    this.setState({templates: newTemplates});
  };

  removeTemplate = (id) => {
    let newTemplates = [...this.state.templates];
    let toRemoveIndex = newTemplates.findIndex(t => t.id === id);
    newTemplates.splice(toRemoveIndex, 1);
    this.setState({templates: newTemplates});
  };

  loadFile = (e) => {
    const file = e.target.files[0];
    const fReader = new FileReader();
    fReader.readAsText(file);
    if(file.name.split('.').pop() !== 'json') {
      alert("Please only select a .json file.");
      return;
    }
    fReader.onloadend = e => {
      const jsonText = e.target.result;
      this.setState({
        loadedFile: file,
        templates: JSON.parse(jsonText)
      })
    };
  };

  saveToFile = () => {
    const { templates } = this.state;
    const jsonText = JSON.stringify(templates, null, 2);
    const blob = new Blob([jsonText], {type: 'application/json'});
    FileSaver.saveAs(blob, "fractal_template.json");
  };

  render() {
    const { templates, loadedFile, activeKey } = this.state;
    const fileLabel = !loadedFile ? "Choose a template file" : loadedFile.name;

    return (
      <div className="app">
        <div className="left-container">
          <Navbar className="navbar" >
            <Form.File className="btn-browse-file" size="sm" label={fileLabel} onChange={this.loadFile} custom/>
            <Button variant="link" onClick={this.saveToFile} >
              <FontAwesomeIcon icon={faDownload} />
            </Button>
          </Navbar>
          <Editor templates = {templates}
                  onNameChange = {this.updateName}
                  onScaleChange = {this.updateScale}
                  onTranslateChange = {this.updateTranslate}
                  onRotateChange = {this.updateRotate}
                  onFlipChange = {this.updateFlipe}
                  onRemove = {this.removeTemplate}
                  onAdd = {this.addTemplate} />
        </div>
        <div className="main">
          <Tabs className="main-tab" id="tab" defaultActiveKey={activeKey}
                onSelect={activeKey => this.setState({activeKey})}>
            <Tab className="tab-content-container" eventKey="editor" title="Template Editor">
              <TemplateDisplay templates = {templates} onTranslateChange = {this.updateTranslate} />
            </Tab>
            <Tab className="tab-content-container" eventKey="fractal" title="Fractal Display">
              <FractalDisplay templates={templates} />
            </Tab>
          </Tabs>
        </div>

      </div>
    );
  }
};