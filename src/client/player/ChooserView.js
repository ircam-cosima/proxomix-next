import * as soundworks from 'soundworks/client';

const template = `
  <div class="chooser-container">
  <% icons.forEach(function(icon, index) { %>
    <div class="chooser-button" data-index="<%= index %>" style="background-image: url(<%= icon %>)"></div>
  <% }); %>
  </div>
`;

class ChooserView extends soundworks.View {
  constructor(icons, buttonCallback) {
    super(template, {
      icons: icons,
    }, {}, {});

    this.icons = icons;
    this.buttonCallback = buttonCallback;

    this.onTouchStart = this.onTouchStart.bind(this);

    this.installEvents({
      'touchstart .chooser-button': this.onTouchStart
    });
  }

  onTouchStart(e) {
    const $el = e.target;
    const index = parseInt($el.dataset.index, 10);
    this.buttonCallback(index);
  }

  onResize(...args) {
    super.onResize(...args);

    const numicons = this.icons.length;
    const numCols = 4;
    const numRows = Math.ceil(numicons / numCols);
    const margin = 10;
    const width = (this.viewportWidth - margin) / numCols - margin;
    const height = (this.viewportHeight - margin) / numRows - margin;
    const $buttons = Array.from(this.$el.querySelectorAll('.chooser-button'));

    for (let i = 0; i < numicons; i++) {
      const row = Math.floor(i / numCols);
      const col = i % numCols;
      const top = margin + row * (height + margin);
      const left = margin + col * (width + margin);
      const $button = $buttons[i];

      $button.style.width = `${width}px`;
      $button.style.height = `${height}px`;
      $button.style.top = `${top}px`;
      $button.style.left = `${left}px`;
    }
  }
}

export default ChooserView;
