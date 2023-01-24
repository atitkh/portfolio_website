# PORTFOLIO WEBSITE

This is a portfolio website developed in React that utilizes JSON data to populate the webpage. The website can be easily customized by cloning the repository and changing the API URL to display your own portfolio information.

## Getting Started

1) Clone the repository to your local machine: git clone https://github.com/atitkh/portfolio_website.git
2) Install the necessary dependencies: npm install
3) Run the development server: npm start
4) The website will be available at http://localhost:3000

## Customizing the Website

To customize the website, you will need to edit the src/components/pages/home/Home.jsx file and change the API URL to point to a different JSON file with your own portfolio information. The json format should be as follows:

```
{
    "title": "John Doe",
    "social_links" : {
        "github": GITHUB_URL,
        "linkedin": LINKEDIN_URL,
        "website": WEBSITE_URL
    },
    "main_categories" : ["Category 1", "Category 2", "Category 3"],
    "portfolio" : [
        {
            "id": 1,
            "title": "Project 1",
            "description": "Project 1 description",
            "image" : IMAGE_URL,
            "video" : VIDEO_URL,
            "projectLink" : [ PROJECT_URL1, PROJECT_URL2 ],
            "categories" : ["Category 1", "Category 2"], // Tools and languages used in project
            "date" : "2019-01-01"
            "mainCategory" : ["Category 1", "Category 2"] // Should be a subset of main_categories
        },
        ...
    ]
}
```

Additionally, you can edit the public/index.html file to change the headings and title images of the website.

## Deployment

To deploy the website, you can run npm run build to create a production-ready build of the website. You can then host the build files on a web server of your choice.