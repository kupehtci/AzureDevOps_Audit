# Azure DevOps Audit

[![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](#)  [![Azure DevOps](https://custom-icon-badges.demolab.com/badge/Azure%20DevOps-0078D7?logo=azure-devops-white&logoColor=fff)](#)  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](#)   [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](#)

AzureDevOps Audit is a React application that allow to query the audit logs from an Azure DevOps organization and list them in a visual and dynamic format. It allow to filter, see all the metadata from the different actions listed and to audit a production Azure DevOps organization. 

# How to start

To start the application, clone the repository and run the react application: 

```bash
git clone https://github.com/kupehtci/AzureDevOps_Audit.git

# And run in dev mode
cd ./AzureDevOps_Audit
npm run dev
```

Also you can easily build the application and then deploy it into a server: 
```bash
npm run build
# Then copy the generated dist/ folder into an NGINX or serving service.
```

# How to use the app

The website asks for organization name and PAT (Personal Access Token) in order to authenticate and obtain the audit logs. 

Once entered this required data, you can see a complete detailed list of the audit logs of the Azure DevOps' organization. 

# Notes

This application consist only in a FrontEnd that doesnt store the input data, so be PATs are not exposed or stored. 