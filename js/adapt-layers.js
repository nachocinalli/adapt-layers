import Adapt from 'core/js/adapt';
import device from 'core/js/device';
import wait from 'core/js/wait';

class Layers extends Backbone.Controller {
  initialize() {
    this.listenTo(Adapt, 'app:dataReady', this.onDataReady);
  }

  static get courseConfig() {
    return Adapt.course.get('_layers');
  }

  isEnabled() {
    return !(!Layers.courseConfig || !Layers.courseConfig._isEnabled);
  }

  onDataReady() {
    if (!this.isEnabled()) {
      return;
    }

    this.setupUpEventListeners();
  }

  setupUpEventListeners() {
    const modelTypes = ['page', 'article', 'block'];

    const modelEventNames = modelTypes.concat(['']).join('View:postRender ');

    this.listenTo(Adapt, modelEventNames, this.onViewRender);
  }

  onViewRender(view) {
    const model = view.model;
    const layers = model.get('_layers');

    if (!layers || !layers._isEnabled) {
      return;
    }
    const _selector = view.$el.find(layers.selector);
    const $el = _selector.length ? _selector : view.$el;
    if (!$el.length) {
      return;
    }
    this.setupLayers(layers, $el);
  }

  setupLayers(model, view) {
    view.addClass('has-layers');
    wait.begin();
    let $layers = view.find(' > .layers');
    if ($layers.length) return;

    $layers = $('<div class="layers" aria-hidden="true"></div>').prependTo(view);

    model._items.forEach((layer) => {
      const $layer = $(`<div class="layer ${layer._classes}"></div>`).appendTo($layers);
      this.addLayerBackground($layer, layer);
    });
    view.find('.layers').imageready(() => {
      wait.end();
    });
  }

  addLayerBackground($layer, layer) {
    const layerGraphics = layer._graphic;
    if (!layerGraphics) return;

    const layerGraphic = layerGraphics[`_${device.screenSize}`] ?? layerGraphics._small;
    $layer.css('background-image', layerGraphic ? 'url(' + layerGraphic + ')' : '');
  }
}

export default new Layers();
