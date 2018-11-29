import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import EsriLoaderReact from 'esri-loader-react';
import isWebGLEnabled from 'is-webgl-enabled';
import isMobile from 'is-mobile';

class MapUi extends React.PureComponent {
  initialState = {
    title: null
  };
  state = this.initialState;

  getUrlParameter = name => {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  loadMap = ({loadedModules: [ESRIMap, SceneView, MapImageLayer, FeatureLayer], containerNode}) => {

    const view = new SceneView({
      container: containerNode,
      map: new ESRIMap({
        basemap: 'satellite',
        ground: 'world-elevation'
      })
      , camera : {
          position: {
            x: -9188342.28,
            y: 4244395.33,
            z: 823,
            spatialReference: {
              wkid: 3857
            }
          },
          heading: 280,
          tilt: 77.5
        }
    });
    
    view.on('click', function(e){
      console.log('quit clicking me mapPoint: ' + JSON.stringify(e.mapPoint));
    }) 
  }

  loadWebmap = ({loadedModules: [Map, MapView, WebMap], containerNode}) => {

    const view = new MapView({
      container: containerNode,
      map: new WebMap({
        portalItem: {
          id: this.getUrlParameter('webmap')
        }
      }),
      padding: { right: 280 }
    });
    view.map.portalItem.when((portalItem) => {
      this.setState({ title: portalItem.title });
    });

  }

  render() {
    const { options } = this.props;
    const { title } = this.state;
    
    const webMapId = this.getUrlParameter('webmap');

    const modules = webMapId
      ? [
          'esri/ESRIMap',
          'esri/views/SceneView',
          'esri/WebMap',
        ]
      : [
          'esri/Map',
          isWebGLEnabled() && !isMobile() ? 'esri/views/SceneView' : 'esri/views/MapView',          
          'esri/layers/MapImageLayer',
          'esri/layers/FeatureLayer',
        ];

    return (
      <EsriLoaderReact 
        mapContainerClassName='fullSize'
        options={options} 
        modulesToLoad={modules}    
        onReady={webMapId ? this.loadWebmap : this.loadMap}
      >
        
      </EsriLoaderReact>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    initLegend: (view, mapId) => {
      dispatch(setInitialLegend(view, mapId));
    }
  };
};

export default connect(null, mapDispatchToProps)(MapUi);
