import * as soundworks from 'soundworks/client';

const template = `
  <div class="chooser-container"></div>
`;

class ChooserView extends soundworks.View {
  constructor(icons, activeButtons, buttonCallback) {
    super(template, {
      icons: icons,
    }, {}, {});

    this.icons = icons;
    this.activeButtons = activeButtons;
    this.buttonCallback = buttonCallback;

    this.buttons = [];
  }

  update() {
    const activeButtons = this.activeButtons;

    for(let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];

      if(activeButtons.has(i))
        button.style.opacity = 1;
      else
        button.style.opacity = 0.33;
    }
  }

  onResize(...args) {
    super.onResize(...args);

    const numIcons = this.icons.length;
    const numCols = 4;
    const numRows = Math.ceil(numIcons / numCols);
    const margin = 10;
    const width = (this.viewportWidth - margin) / numCols - margin;
    const height = (this.viewportHeight - margin) / numRows - margin;
    const container = this.$el.querySelector('.chooser-container');
    const icons = this.icons;

    this.buttons = [];

    for (let i = 0; i < numIcons; i++) {
      const row = Math.floor(i / numCols);
      const col = i % numCols;
      const top = margin + row * (height + margin);
      const left = margin + col * (width + margin);
      const button = document.createElement("div");

      button.classList.add('chooser-button');
      button.style.backgroundImage = `url('${icons[i]}')`;
      button.style.width = `${width}px`;
      button.style.height = `${height}px`;
      button.style.top = `${top}px`;
      button.style.left = `${left}px`;
      button.addEventListener('touchstart', this.onTouchStart(i));

      container.appendChild(button);
      this.buttons.push(button);
    }

    this.update();
  }

  onTouchStart(index) {
    return () => {
      this.buttonCallback(index);
    };
  }

}

export default ChooserView;
