# UM Merchandise Management System

A web-based application developed for the External Relations and International Affairs Office (ERIAO) of the University of Mindanao. The system manages UM Merch, a collection of official university apparel and souvenirs that promote school pride and unity among UMians.

## Project Overview

The UM Merchandise Management System is a web-based application developed for the External Relations and International Affairs Office (ERIAO) of the University of Mindanao. The system manages UM Merch, a collection of official university apparel and souvenirs that promote school pride and unity among UMians.

Launched as part of ERIAO's expanding role, UM Merch gained popularity through the #UMIANvibe campaign and continues to thrive as a symbol of belonging for students, employees, alumni, and the global UM community.

## Tech Stack

- **Backend:** Laravel 13 (PHP 8.3)
- **Frontend:** React 19 + Vite + Tailwind CSS
- **Mobile:** Expo / React Native

## Repository Structure

| Directory    | Description                          |
| ------------ | ------------------------------------ |
| `backend/`   | Laravel API and web application      |
| `frontend/`  | React + Vite + Tailwind CSS client   |
| `mobile/`    | Expo / React Native mobile app       |

## Getting Started

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npm run start
```

## Group Members

- Kent Leonel Sevellino
- Yosh Batula
- Jan Vincent Oclarit
- Mheil Andrei Cenita

## Course

CCE 106L – Applications Development and Emerging Technologies