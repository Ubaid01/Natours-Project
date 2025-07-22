<div align="center">
  <h2 align="center"> Natours </h2>

  <img src="https://github.com/Ubaid01/Natours-Project/blob/master/public/img/logo-green-round.png" alt="Natours Logo" width="100px">
  
  **A full-featured tour booking platform built with Node.js, Express, and MongoDB**
  
  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-brightgreen)](https://natours-project-u1.vercel.app)
  [![API Docs](https://img.shields.io/badge/API-Documentation-orange)](https://documenter.getpostman.com/view/8893042/SW7c37V6)
</div>

---

## Features

- Secure user authentication and authorization  
- Role-based access control (Admin, Lead-Guide, Guide, User)  
- Tour analytics with MongoDB aggregations  
- Real-time tour booking with Stripe  
- Mapbox integration for geo-spatial queries and visualizations  
- Review and rating system for tours  
- Fully responsive frontend using Pug and SCSS  

---

## Live Demo

- **Live App**: [Natours on Vercel](https://natours-project-u1.vercel.app)  
- **API Documentation**: [Postman Docs](https://documenter.getpostman.com/view/8893042/SW7c37V6)  
---

## Screenshots
## Screenshots

<div align="center">

  <table>
    <tr>
      <td align="center"><strong>Homepage</strong><br/>
        <img src="https://user-images.githubusercontent.com/58518192/72606801-7ebe0680-3949-11ea-8e88-613f022a64e5.gif" width="300px"/>
      </td>
      <td align="center"><strong>Tour Details</strong><br/>
        <img src="https://user-images.githubusercontent.com/58518192/72606859-a0b78900-3949-11ea-8f0d-ef44c789957b.gif" width="300px"/>
      </td>
    </tr>
    <tr>
      <td align="center"><strong>Booking & Payment</strong><br/>
        <img src="https://user-images.githubusercontent.com/58518192/72606973-d9eff900-3949-11ea-9a2e-f84a6581bef3.gif" width="300px"/>
      </td>
      <td align="center"><strong>Booked Tours</strong><br/>
        <img src="https://user-images.githubusercontent.com/58518192/72607747-6a7b0900-394b-11ea-8b9f-5330531ca2eb.png" width="300px"/>
      </td>
    </tr>
    <tr>
      <td align="center"><strong>User Profile</strong><br/>
        <img src="https://user-images.githubusercontent.com/58518192/72607635-44edff80-394b-11ea-8943-64c48f6f19aa.png" width="300px"/>
      </td>
      <td align="center"><strong>Admin Panel</strong><br/>
        <img src="https://user-images.githubusercontent.com/58518192/72607648-4d463a80-394b-11ea-972f-a73160cfaa5b.png" width="300px"/>
      </td>
    </tr>
  </table>

</div>

---

## API Endpoints

> Base URL: `https://natours-project-u1.vercel.app/api/v1`

Examples:

- `GET /tours` — List all tours  
- `GET /tours/top-5-cheap` — Top 5 cheapest tours  
- `GET /tours/tours-within/:distance/center/:latlng/unit/:unit` — Get tours within a given distance  
- `GET /tours/distances/:latlng/unit/:unit` — Calculate distances from a location  

---

## Getting Started

To test the API using Postman, set up environment variables like:

```bash
{{URL}} = https://natours-project-u1.vercel.app
{{password}} = userpass
```

## Integerations

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: Pug, CSS, Parcel
- Auth: JWT (JSON Web Tokens)
- Payments: Stripe
- Emails: Mailtrap, SendGrid
- Maps & Geo: Mapbox

## Acknowledgement 

- Built as part of the Node.js, Express, MongoDB Bootcamp by Jonas Schmedtmann.[Node.js Express MongoDB Bootcamp](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/). A lot of credit and inspiration goes to this course and the phenomenal instructor.
grid-template-co