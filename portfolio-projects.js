import projectsData from './projects-data.js';

class PortfolioProjects {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedHashtags = [];
    this.init();
  }
  
  init() {
    this.render();
    this.setupHashtagFilters();
  }
  
  // Get unique hashtags
  getProjectHashtags() {
    const hashtags = new Set();
    projectsData.forEach(project => {
      project.hashtags.forEach(tag => hashtags.add(tag));
    });
    return Array.from(hashtags);
  }
  
  // Create filter buttons
  createFilterButtons() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'project-filter-container';
    
    const filterTitle = document.createElement('div');
    filterTitle.className = 'project-filter-title';
    
    const filterIcon = document.createElement('span');
    filterIcon.innerHTML = '<i class="bi bi-funnel"></i>';
    filterIcon.className = 'project-filter-icon';
    
    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.className = 'project-filter-buttons';
    
    this.getProjectHashtags().forEach(hashtag => {
      const button = document.createElement('button');
      button.textContent = hashtag;
      button.className = 'project-filter-button';
      
      button.dataset.hashtag = hashtag;
      
      button.addEventListener('click', () => {
        this.toggleHashtagFilter(hashtag, button);
      });
      
      buttonsWrapper.appendChild(button);
    });
    
    filterTitle.appendChild(filterIcon);
    filterContainer.appendChild(filterTitle);
    filterContainer.appendChild(buttonsWrapper);
    
    return filterContainer;
  }
  
  // Toggle hashtag filter
  toggleHashtagFilter(hashtag, buttonElement) {
    if (this.selectedHashtags.includes(hashtag)) {
      this.selectedHashtags = this.selectedHashtags.filter(tag => tag !== hashtag);
      buttonElement.classList.remove('project-filter-button-active');
    } else {
      this.selectedHashtags.push(hashtag);
      buttonElement.classList.add('project-filter-button-active');
    }
    
    this.renderProjects();
  }
  
  // Setup filter buttons
  setupHashtagFilters() {
    const filterContainer = this.createFilterButtons();
    this.container.insertBefore(filterContainer, this.container.firstChild);
  }
  
  // Filter projects based on selected hashtags
  filterProjects() {
    return this.selectedHashtags.length === 0
      ? projectsData
      : projectsData.filter(project =>
          this.selectedHashtags.some(tag => project.hashtags.includes(tag))
        );
  }
  
  // Create project card
  createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';

    // Main wrapper for card content
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'project-card-wrapper';

    // Image Container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'project-image-container';
    const image = document.createElement('img');
    image.src = project.image || 'placeholder.jpg';
    image.alt = project.title;
    image.className = 'project-image';
    imageContainer.appendChild(image);

    // Content Container
    const content = document.createElement('div');
    content.className = 'project-content';

    // Project Header
    const header = document.createElement('div');
    header.className = 'project-header';

    const title = document.createElement('h2');
    title.textContent = project.title;
    title.className = 'project-title';

    const links = document.createElement('div');
    links.className = 'project-links';

    // Conditionally render links
    if (project.links?.github) {
      const githubLink = document.createElement('a');
      githubLink.href = project.links.github;
      githubLink.target = '_blank';
      githubLink.innerHTML = '<i class="bi bi-github"></i>';
      githubLink.className = 'project-link-github';
      links.appendChild(githubLink);
    }

    if (project.links?.live) {
      const liveLink = document.createElement('a');
      liveLink.href = project.links.live;
      liveLink.target = '_blank';
      liveLink.innerHTML = '<i class="bi bi-globe"></i>';
      liveLink.className = 'project-link-live';
      links.appendChild(liveLink);
    }

    if (project.links?.youtube) {
      const youtubeLink = document.createElement('a');
      youtubeLink.href = project.links.youtube;
      youtubeLink.target = '_blank';
      youtubeLink.innerHTML = '<i class="bi bi-youtube"></i>';
      youtubeLink.className = 'project-link-youtube';
      links.appendChild(youtubeLink);
    }

    if (project.links?.figma) {
      const figmaLink = document.createElement('a');
      figmaLink.href = project.links.figma;
      figmaLink.target = '_blank';
      figmaLink.innerHTML = '<i class="bi bi-vector-pen"></i>'; // Use an icon of your choice
      figmaLink.className = 'project-link-figma';
      links.appendChild(figmaLink);
    }
  
    if (project.links?.adobeXD) {
      const adobeXDLink = document.createElement('a');
      adobeXDLink.href = project.links.adobeXD;
      adobeXDLink.target = '_blank';
      adobeXDLink.innerHTML = '<i class="bi bi-vector-pen"></i>'; // Use an icon of your choice
      adobeXDLink.className = 'project-link-adobeXD';
      links.appendChild(adobeXDLink);
    }

    if (project.links?.imagelink) {
      const imagelink = document.createElement('a');
      imagelink.href = project.links.imagelink;
      imagelink.target = '_blank';
      imagelink.innerHTML = '<i class="bi bi-image"></i>'; // Use an icon
      imagelink.className = 'project-link-imagelink';
      links.appendChild(imagelink);
    }

    header.appendChild(title);
    header.appendChild(links);
    content.appendChild(header);

    // Year Label
    const yearLabel = document.createElement('span');
    yearLabel.textContent = `${project.month} ${project.year}`;
    yearLabel.className = 'project-year-label';
    content.appendChild(yearLabel);

    // Description
    const description = document.createElement('p');
    description.textContent = project.description;
    description.className = 'project-description';
    content.appendChild(description);

    // Hashtags
    const hashtagContainer = document.createElement('div');
    hashtagContainer.className = 'project-hashtags';
    project.hashtags.forEach(hashtag => {
      const hashtagSpan = document.createElement('span');
      hashtagSpan.textContent = hashtag;
      hashtagSpan.className = 'project-hashtag';
      hashtagContainer.appendChild(hashtagSpan);
    });
    content.appendChild(hashtagContainer);

    // Append imageContainer and content to cardWrapper
    cardWrapper.appendChild(imageContainer);
    cardWrapper.appendChild(content);

    // Add cardWrapper to card
    card.appendChild(cardWrapper);

    return card;
  }
  
  // Render projects
  renderProjects() {
    let existingTimeline = this.container.querySelector('.project-timeline');
    if (existingTimeline) {
      existingTimeline.remove();
    }

    const timeline = document.createElement('div');
    timeline.className = 'project-timeline';

    this.filterProjects().forEach(project => {
      const projectCard = this.createProjectCard(project);
      timeline.appendChild(projectCard);
    });

    this.container.appendChild(timeline);
  }
  
  // Initial render
  render() {
    this.container.className = 'project-container';
    this.renderProjects();
  }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioProjects('portfolio-projects');
});
