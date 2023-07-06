# PORTFOLIO WEBSITE

This is a portfolio website developed in React that utilizes JSON data to populate the webpage. The website can be easily customized by cloning the repository and changing the API URL to display your own portfolio information.

## Getting Started

1) Clone the repository to your local machine: 
```
git clone https://github.com/atitkh/portfolio_website.git
```
2) Install the necessary dependencies: 
```
npm install
```
3) Run the development server: 
```
npm start
```
4) The website will be available at http://localhost:3000
5) To build the website for production, run: 
```
npm run build
```
6) The build files will be available in the build/ directory

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

## WebAR Support

The website also supports WebAR through SnapAR Camera Kit. Follow these steps if you have access to Camera Kit and want to enable WebAR support:

1) Obtain Snap API Token and Lens Group ID from Camera Kit developer portal
2) Create a .env file in the root directory of the project and add the following lines:

```
#.env file contents
REACT_APP_SNAP_TOKEN="your_snap_api_token"
REACT_APP_LENS_GROUP_ID="your_lens_group_id"
```
Replace "your_snap_api_token" with the Snap API token you obtained in step 1, and "your_lens_group_id" with your actual lens group ID.

3) Integrate WebAR in Your Project: In your project's JSON data, add a new key called 'lensID'. Assign the value of this key as the lens ID you want to use for WebAR integration. For example:

```
{
    "id": 1,
    "title": "Project 1",
    "lensID" : "your_lens_id",
    ...
}
``` 
Replace "your_lens_id" with the actual lens ID you want to use for WebAR integration.

## Deployment

To deploy the website, you can run npm run build to create a production-ready build of the website. You can then host the build files on a web server of your choice.