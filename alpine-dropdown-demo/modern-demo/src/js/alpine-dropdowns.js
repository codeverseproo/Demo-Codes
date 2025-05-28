// Alpine.js Dropdown Components
document.addEventListener('alpine:init', () => {
  // Register a reusable dropdown component
  Alpine.data('dropdown', (options = {}) => ({
    open: false,
    arrowRotation: false,
    
    // Allow customization through options
    hoverBehavior: options.hoverBehavior || false,
    position: options.position || 'bottom',
    closeOnClick: options.closeOnClick !== undefined ? options.closeOnClick : true,
    
    toggle() {
      this.open = !this.open;
      this.arrowRotation = this.open;
    },
    
    close() {
      this.open = false;
      this.arrowRotation = false;
    },
    
    init() {
      if (this.hoverBehavior) {
        this.$el.addEventListener('mouseenter', () => {
          this.open = true;
          this.arrowRotation = true;
        });
        
        this.$el.addEventListener('mouseleave', () => {
          this.open = false;
          this.arrowRotation = false;
        });
      }
      
      // Handle keyboard navigation
      this.$watch('open', (value) => {
        if (value) {
          this.$nextTick(() => {
            const firstItem = this.$el.querySelector('.dropdown-item');
            if (firstItem) firstItem.focus();
          });
        }
      });
    }
  }));
});
