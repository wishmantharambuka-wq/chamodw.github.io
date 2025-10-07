/* ==========================================
   MODERN RAMBUKA VILLAGE WEBSITE JAVASCRIPT
   Optimized with ES6+ Features and Modules
   ========================================== */

// ==========================================
// MAIN APPLICATION CLASS
// ==========================================
class RambukaApp {
  constructor() {
    this.init();
  }

  init() {
    this.navigation = new Navigation();
    this.scrollHandler = new ScrollHandler();
    this.mapHandler = new MapHandler();
    this.chartHandler = new ChartHandler();
    this.formHandler = new FormHandler();
    this.animationHandler = new AnimationHandler();

    this.bindEvents();
    this.logWelcomeMessage();
  }

  bindEvents() {
    // Page loaded event
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.onDOMReady());
    } else {
      this.onDOMReady();
    }

    // Window loaded event (for external resources)
    window.addEventListener("load", () => this.onWindowLoad());

    // Window resize event
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.onWindowResize(), 100);
    });
  }

  onDOMReady() {
    this.animationHandler.init();
    this.navigation.init();
    this.scrollHandler.init();
    console.log("DOM ready - Basic functionality initialized");
  }

  onWindowLoad() {
    this.mapHandler.init();
    this.chartHandler.init();
    console.log("Window loaded - Maps and charts initialized");
  }

  onWindowResize() {
    this.mapHandler.resize();
    this.chartHandler.resize();
  }

  logWelcomeMessage() {
    console.log(`
🌿 Welcome to Rambuka Village Website
=====================================
Created for: University of Moratuwa
Department: Town & Country Planning

This website showcases the natural beauty and
geospatial information of Rambuka Village.

Enjoy exploring! 🗺️
        `);
  }
}

// ==========================================
// NAVIGATION HANDLER
// ==========================================
class Navigation {
  constructor() {
    this.navMenu = null;
    this.navLinks = [];
    this.mobileToggle = null;
    this.isMenuOpen = false;
  }

  init() {
    this.navMenu = document.getElementById("navMenu");
    this.navLinks = document.querySelectorAll(".nav-link");
    this.mobileToggle = document.querySelector(".mobile-menu-toggle");

    this.bindEvents();
  }

  bindEvents() {
    // Mobile menu toggle
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener("click", () =>
        this.toggleMobileMenu()
      );
    }

    // Navigation link clicks
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => this.handleNavClick(e, link));
    });

    // Close mobile menu on outside click
    document.addEventListener("click", (e) => this.handleOutsideClick(e));

    // Close mobile menu on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.navMenu) {
      this.navMenu.classList.toggle("active");
    }

    if (this.mobileToggle) {
      this.mobileToggle.setAttribute("aria-expanded", this.isMenuOpen);
      this.mobileToggle.innerHTML = this.isMenuOpen ? "✕ Close" : "☰ Menu";
    }
  }

  closeMobileMenu() {
    this.isMenuOpen = false;

    if (this.navMenu) {
      this.navMenu.classList.remove("active");
    }

    if (this.mobileToggle) {
      this.mobileToggle.setAttribute("aria-expanded", "false");
      this.mobileToggle.innerHTML = "☰ Menu";
    }
  }

  handleNavClick(e, link) {
    // Close mobile menu after click
    if (window.innerWidth <= 768 && this.isMenuOpen) {
      setTimeout(() => this.closeMobileMenu(), 100);
    }

    // Handle different page navigation
    const href = link.getAttribute("href");
    if (href && href.endsWith(".html")) {
      // External page navigation
      window.location.href = href;
      e.preventDefault();
    }
  }

  handleOutsideClick(e) {
    if (
      this.isMenuOpen &&
      !this.navMenu?.contains(e.target) &&
      !this.mobileToggle?.contains(e.target)
    ) {
      this.closeMobileMenu();
    }
  }

  updateActiveLink(activeSection) {
    this.navLinks.forEach((link) => {
      link.classList.remove("active");
      const linkHref = link.getAttribute("href");

      if (
        linkHref === `#${activeSection}` ||
        (linkHref === "index.html" && activeSection === "home")
      ) {
        link.classList.add("active");
      }
    });
  }
}

// ==========================================
// SCROLL HANDLER
// ==========================================
class ScrollHandler {
  constructor() {
    this.scrollToTopBtn = null;
    this.sections = [];
    this.isScrolling = false;
    this.navigation = null;
  }

  init() {
    this.scrollToTopBtn =
      document.getElementById("scrollTop") || this.createScrollToTopButton();
    this.sections = document.querySelectorAll("section[id]");
    this.navigation = window.app?.navigation;

    this.bindEvents();
  }

  bindEvents() {
    let scrollTimeout;
    window.addEventListener(
      "scroll",
      () => {
        if (!this.isScrolling) {
          this.isScrolling = true;
          requestAnimationFrame(() => {
            this.handleScroll();
            this.isScrolling = false;
          });
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => this.updateActiveSection(), 10);
      },
      { passive: true }
    );

    if (this.scrollToTopBtn) {
      this.scrollToTopBtn.addEventListener("click", () => this.scrollToTop());
    }
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Show/hide scroll to top button
    if (this.scrollToTopBtn) {
      if (scrollTop > 300) {
        this.scrollToTopBtn.classList.add("visible");
      } else {
        this.scrollToTopBtn.classList.remove("visible");
      }
    }
  }

  updateActiveSection() {
    let current = "";
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (scrollTop >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    if (this.navigation && current) {
      this.navigation.updateActiveLink(current);
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  createScrollToTopButton() {
    const button = document.createElement("button");
    button.id = "scrollTop";
    button.className = "scroll-to-top";
    button.innerHTML = "↑";
    button.setAttribute("aria-label", "Scroll to top");
    document.body.appendChild(button);
    return button;
  }
}

// ==========================================
// MAP HANDLER (Leaflet.js)
// ==========================================
class MapHandler {
  constructor() {
    this.map = null;
    this.markers = [];
    this.mapContainer = null;
    this.centerLat = 6.4;
    this.centerLng = 80.5;
  }

  init() {
    this.mapContainer = document.getElementById("map");

    if (!this.mapContainer) {
      console.log("Map container not found on this page");
      return;
    }

    if (typeof L === "undefined") {
      console.error("Leaflet library not loaded");
      return;
    }

    this.initializeMap();
    this.addMarkers();
    this.bindEvents();
  }

  initializeMap() {
    try {
      this.map = L.map("map", {
        center: [this.centerLat, this.centerLng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(this.map);

      console.log("Map initialized successfully");
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }

  addMarkers() {
    const locations = [
      {
        lat: this.centerLat,
        lng: this.centerLng,
        title: "🏘️ Rambuka Village Center",
        description: "Population: 2,318<br>Area: 1,159 km²",
      },
      {
        lat: this.centerLat + 0.02,
        lng: this.centerLng + 0.015,
        title: "🗿 Stone Columns",
        description: "Ancient geological formation<br>Main tourist attraction",
      },
      {
        lat: this.centerLat - 0.03,
        lng: this.centerLng - 0.02,
        title: "🌳 Sinharaja Rain Forest Border",
        description: "UNESCO World Heritage Site<br>Rich biodiversity",
      },
      {
        lat: this.centerLat + 0.01,
        lng: this.centerLng - 0.01,
        title: "💧 Mountain Stream",
        description: "Fresh water source<br>Year-round flow",
      },
      {
        lat: this.centerLat - 0.015,
        lng: this.centerLng + 0.02,
        title: "🌾 Agricultural Zone",
        description: "Rice paddies and spice gardens<br>Traditional farming",
      },
    ];

    locations.forEach((location) => {
      const marker = L.marker([location.lat, location.lng])
        .addTo(this.map)
        .bindPopup(`<b>${location.title}</b><br>${location.description}`);

      this.markers.push(marker);
    });

    // Village boundary polygon
    const villageBoundary = L.polygon(
      [
        [this.centerLat + 0.04, this.centerLng - 0.03],
        [this.centerLat + 0.04, this.centerLng + 0.04],
        [this.centerLat - 0.05, this.centerLng + 0.04],
        [this.centerLat - 0.05, this.centerLng - 0.03],
      ],
      {
        color: "#4C8C4A",
        fillColor: "#CDE8C4",
        fillOpacity: 0.3,
        weight: 2,
      }
    )
      .addTo(this.map)
      .bindPopup(
        "<b>Rambuka Village Boundary</b><br>Approximate administrative area"
      );

    this.markers.push(villageBoundary);

    // Open the village center popup
    if (this.markers[0]) {
      this.markers[0].openPopup();
    }
  }

  bindEvents() {
    // Reset map button
    const resetBtn = document.getElementById("resetMapBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetMap());
    }

    // Download buttons
    const downloadGeoJSONBtn = document.getElementById("downloadGeoJSONBtn");
    if (downloadGeoJSONBtn) {
      downloadGeoJSONBtn.addEventListener("click", () =>
        this.downloadGeoJSON()
      );
    }

    const downloadCSVBtn = document.getElementById("downloadCSVBtn");
    if (downloadCSVBtn) {
      downloadCSVBtn.addEventListener("click", () => this.downloadCSV());
    }
  }

  resetMap() {
    if (this.map) {
      this.map.setView([this.centerLat, this.centerLng], 13);
    }
  }

  resize() {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    }
  }

  downloadGeoJSON() {
    const geoData = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Rambuka Village Center",
            type: "settlement",
            population: 2318,
            area_km2: 1159,
          },
          geometry: {
            type: "Point",
            coordinates: [this.centerLng, this.centerLat],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Stone Columns",
            type: "attraction",
          },
          geometry: {
            type: "Point",
            coordinates: [this.centerLng + 0.015, this.centerLat + 0.02],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Sinharaja Forest Border",
            type: "conservation",
          },
          geometry: {
            type: "Point",
            coordinates: [this.centerLng - 0.02, this.centerLat - 0.03],
          },
        },
      ],
    };

    this.downloadFile(geoData, "rambuka_village.geojson", "application/json");
  }

  downloadCSV() {
    const csvData = `Name,Type,Latitude,Longitude,Description
Rambuka Village Center,Settlement,${this.centerLat},${
      this.centerLng
    },"Population: 2318, Area: 1159 km²"
Stone Columns,Attraction,${this.centerLat + 0.02},${
      this.centerLng + 0.015
    },Ancient geological formation
Sinharaja Forest Border,Conservation,${this.centerLat - 0.03},${
      this.centerLng - 0.02
    },UNESCO World Heritage Site
Mountain Stream,Water Source,${this.centerLat + 0.01},${
      this.centerLng - 0.01
    },Year-round fresh water
Agricultural Zone,Agriculture,${this.centerLat - 0.015},${
      this.centerLng + 0.02
    },Traditional farming area`;

    this.downloadFile(csvData, "rambuka_village_data.csv", "text/csv");
  }

  downloadFile(data, filename, mimeType) {
    const dataStr =
      typeof data === "object" ? JSON.stringify(data, null, 2) : data;
    const dataBlob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showNotification(`✅ ${filename} downloaded successfully!`);
  }

  showNotification(message) {
    // Create a simple notification
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--forest-green);
            color: white;
            padding: 1rem;
            border-radius: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }
}

// ==========================================
// CHART HANDLER (Chart.js)
// ==========================================
class ChartHandler {
  constructor() {
    this.charts = [];
  }

  init() {
    this.initPopulationChart();
    this.initOtherCharts();
  }

  initPopulationChart() {
    const chartCanvas = document.getElementById("populationChart");

    if (!chartCanvas) {
      console.log("Population chart canvas not found on this page");
      return;
    }

    if (typeof Chart === "undefined") {
      console.error("Chart.js library not loaded");
      return;
    }

    try {
      const ctx = chartCanvas.getContext("2d");

      const chart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Male (1,149)", "Female (1,169)"],
          datasets: [
            {
              data: [1149, 1169],
              backgroundColor: [
                "rgba(76, 140, 74, 0.8)",
                "rgba(169, 203, 166, 0.8)",
              ],
              borderColor: ["rgba(76, 140, 74, 1)", "rgba(169, 203, 166, 1)"],
              borderWidth: 2,
              hoverOffset: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                font: {
                  family: "Poppins",
                  size: 14,
                },
                padding: 20,
                usePointStyle: true,
              },
            },
            title: {
              display: true,
              text: "Total Population: 2,318",
              font: {
                family: "Poppins",
                size: 16,
                weight: "bold",
              },
              color: "#4C8C4A",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || "";
                  const percentage = ((context.parsed / 2318) * 100).toFixed(1);
                  return `${label}: ${percentage}%`;
                },
              },
            },
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
          },
        },
      });

      this.charts.push(chart);
      console.log("Population chart initialized successfully");
    } catch (error) {
      console.error("Error initializing population chart:", error);
    }
  }

  initOtherCharts() {
    // Land use chart
    const landUseCanvas = document.getElementById("landUseChart");
    if (landUseCanvas && typeof Chart !== "undefined") {
      this.initLandUseChart(landUseCanvas);
    }

    // Climate chart
    const climateCanvas = document.getElementById("climateChart");
    if (climateCanvas && typeof Chart !== "undefined") {
      this.initClimateChart(climateCanvas);
    }
  }

  initLandUseChart(canvas) {
    try {
      const ctx = canvas.getContext("2d");
      const chart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: [
            "Forest (65%)",
            "Agriculture (25%)",
            "Settlement (8%)",
            "Water (2%)",
          ],
          datasets: [
            {
              data: [65, 25, 8, 2],
              backgroundColor: ["#4C8C4A", "#A9CBA6", "#D9D9D9", "#6BB6FF"],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Land Use Distribution",
              font: { family: "Poppins", size: 16 },
            },
          },
        },
      });
      this.charts.push(chart);
    } catch (error) {
      console.error("Error initializing land use chart:", error);
    }
  }

  initClimateChart(canvas) {
    try {
      const ctx = canvas.getContext("2d");
      const chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Temperature (°C)",
              data: [24, 25, 26, 27, 27, 26, 26, 26, 26, 26, 25, 24],
              borderColor: "#4C8C4A",
              tension: 0.4,
            },
            {
              label: "Rainfall (mm)",
              data: [
                150, 100, 180, 220, 380, 400, 350, 300, 250, 300, 200, 180,
              ],
              borderColor: "#6BB6FF",
              tension: 0.4,
              yAxisID: "y1",
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Temperature (°C)" },
            },
            y1: {
              type: "linear",
              position: "right",
              beginAtZero: true,
              title: { display: true, text: "Rainfall (mm)" },
            },
          },
        },
      });
      this.charts.push(chart);
    } catch (error) {
      console.error("Error initializing climate chart:", error);
    }
  }

  resize() {
    this.charts.forEach((chart) => {
      if (chart && typeof chart.resize === "function") {
        chart.resize();
      }
    });
  }

  destroy() {
    this.charts.forEach((chart) => {
      if (chart && typeof chart.destroy === "function") {
        chart.destroy();
      }
    });
    this.charts = [];
  }
}

// ==========================================
// FORM HANDLER
// ==========================================
class FormHandler {
  constructor() {
    this.forms = [];
  }

  init() {
    // Contact form
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
      this.initContactForm(contactForm);
    }

    // Newsletter form
    const newsletterForm = document.getElementById("newsletterForm");
    if (newsletterForm) {
      this.initNewsletterForm(newsletterForm);
    }
  }

  initContactForm(form) {
    form.addEventListener("submit", (e) => this.handleContactSubmit(e));
    this.addFormValidation(form);
  }

  initNewsletterForm(form) {
    form.addEventListener("submit", (e) => this.handleNewsletterSubmit(e));
  }

  handleContactSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    if (!this.validateContactForm(data)) {
      return false;
    }

    // Simulate form submission
    this.showFormSuccess(
      `✅ Thank you, ${data.name}!\\n\\nYour message has been received. We'll get back to you at ${data.email} soon.`
    );

    // Reset form
    event.target.reset();
    return false;
  }

  handleNewsletterSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = formData.get("email");

    if (!this.validateEmail(email)) {
      this.showFormError("Please enter a valid email address.");
      return false;
    }

    this.showFormSuccess(`✅ Thank you! You've been subscribed with ${email}`);
    event.target.reset();
    return false;
  }

  validateContactForm(data) {
    if (!data.name || data.name.length < 2) {
      this.showFormError("Please enter a valid name (at least 2 characters).");
      return false;
    }

    if (!this.validateEmail(data.email)) {
      this.showFormError("Please enter a valid email address.");
      return false;
    }

    if (!data.message || data.message.length < 10) {
      this.showFormError("Please enter a message (at least 10 characters).");
      return false;
    }

    return true;
  }

  validateEmail(email) {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
  }

  addFormValidation(form) {
    const inputs = form.querySelectorAll("input, textarea");

    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => this.clearFieldError(input));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = "";

    switch (field.type) {
      case "email":
        isValid = this.validateEmail(value);
        errorMessage = "Please enter a valid email address";
        break;
      case "text":
        if (field.required && value.length < 2) {
          isValid = false;
          errorMessage = "This field must be at least 2 characters long";
        }
        break;
      case "textarea":
        if (field.required && value.length < 10) {
          isValid = false;
          errorMessage = "Message must be at least 10 characters long";
        }
        break;
    }

    this.setFieldValidation(field, isValid, errorMessage);
    return isValid;
  }

  setFieldValidation(field, isValid, errorMessage) {
    const errorElement =
      field.parentNode.querySelector(".field-error") ||
      this.createErrorElement(field.parentNode);

    if (isValid) {
      field.classList.remove("error");
      errorElement.textContent = "";
      errorElement.style.display = "none";
    } else {
      field.classList.add("error");
      errorElement.textContent = errorMessage;
      errorElement.style.display = "block";
    }
  }

  createErrorElement(parent) {
    const errorElement = document.createElement("div");
    errorElement.className = "field-error";
    errorElement.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: none;
        `;
    parent.appendChild(errorElement);
    return errorElement;
  }

  clearFieldError(field) {
    field.classList.remove("error");
    const errorElement = field.parentNode.querySelector(".field-error");
    if (errorElement) {
      errorElement.style.display = "none";
    }
  }

  showFormSuccess(message) {
    alert(message);
    // Could be replaced with a custom modal or notification system
  }

  showFormError(message) {
    alert(message);
    // Could be replaced with a custom modal or notification system
  }
}

// ==========================================
// ANIMATION HANDLER
// ==========================================
class AnimationHandler {
  constructor() {
    this.observer = null;
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };
  }

  init() {
    this.createIntersectionObserver();
    this.observeElements();
  }

  createIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
        }
      });
    }, this.observerOptions);
  }

  observeElements() {
    // Animate containers
    const containers = document.querySelectorAll(
      ".glass-container, .card, .container"
    );
    containers.forEach((container) => {
      this.prepareElement(container);
      this.observer.observe(container);
    });

    // Animate individual elements
    const animateElements = document.querySelectorAll("[data-animate]");
    animateElements.forEach((element) => {
      this.prepareElement(element);
      this.observer.observe(element);
    });
  }

  prepareElement(element) {
    // Only prepare if not already animated
    if (!element.hasAttribute("data-animated")) {
      element.style.opacity = "0";
      element.style.transform = "translateY(30px)";
      element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    }
  }

  animateElement(element) {
    if (!element.hasAttribute("data-animated")) {
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
      element.setAttribute("data-animated", "true");
    }
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const Utils = {
  // Debounce function
  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Format number with commas
  formatNumber(num) {
    return num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
  },

  // Get current page name
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    return page || "index.html";
  },

  // Smooth scroll to element
  scrollToElement(elementId, offset = 100) {
    const element = document.getElementById(elementId);
    if (element) {
      const top = element.offsetTop - offset;
      window.scrollTo({
        top: top,
        behavior: "smooth",
      });
    }
  },
};

// ==========================================
// GLOBAL FUNCTIONS (for backward compatibility)
// ==========================================
function toggleMenu() {
  if (window.app?.navigation) {
    window.app.navigation.toggleMobileMenu();
  }
}

function scrollToTop() {
  if (window.app?.scrollHandler) {
    window.app.scrollHandler.scrollToTop();
  }
}

function resetMap() {
  if (window.app?.mapHandler) {
    window.app.mapHandler.resetMap();
  }
}

function downloadGeoJSON() {
  if (window.app?.mapHandler) {
    window.app.mapHandler.downloadGeoJSON();
  }
}

function downloadCSV() {
  if (window.app?.mapHandler) {
    window.app.mapHandler.downloadCSV();
  }
}

function handleFormSubmit(event) {
  if (window.app?.formHandler) {
    return window.app.formHandler.handleContactSubmit(event);
  }
  return false;
}

// ==========================================
// INITIALIZE APPLICATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  window.app = new RambukaApp();
});

// Add error handling for unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  event.preventDefault();
});

// Add error handling for general JavaScript errors
window.addEventListener("error", (event) => {
  console.error("JavaScript error:", event.error);
});

// Export for module systems (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    RambukaApp,
    Navigation,
    ScrollHandler,
    MapHandler,
    ChartHandler,
    FormHandler,
    AnimationHandler,
    Utils,
  };
}
