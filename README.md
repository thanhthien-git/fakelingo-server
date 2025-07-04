# Fakelingo Dating App – Microservices Architecture

## Overview

**Fakelingo** is a modern dating app built with a microservices architecture using Node.js, NestJS, MongoDB, and RabbitMQ. The system is designed for scalability, maintainability, and real-time communication between users.

This repository contains the backend services for the app, each responsible for a specific domain:

- **API Gateway**: Entry point for all client requests, handles routing and authentication.
- **Auth Service**: Manages user authentication and authorization.
- **User Service**: Handles user profiles, preferences, and related data.
- **Message Service**: Manages real-time chat and message history.
- **Notification Service**: Sends push notifications and system alerts.

The architecture is illustrated in the following diagram:  
![System Architecture](https://ibb.co/kWm8d3d)

---

## Microservices Breakdown

### 1. API Gateway
- **Role**: Central entry point for all client requests.
- **Responsibilities**: Routing, authentication, request validation, and proxying to internal services.

### 2. Auth Service
- **Role**: Handles user registration, login, JWT token issuance, and validation.
- **Tech**: NestJS, MongoDB

### 3. User Service
- **Role**: Manages user profiles, preferences, and search/match logic.
- **Tech**: NestJS, MongoDB

### 4. Message Service
- **Role**: Real-time chat, message storage, and conversation management.
- **Tech**: NestJS, MongoDB, WebSocket, RabbitMQ (for event-driven notifications)

### 5. Notification Service
- **Role**: Sends push notifications (e.g., new messages, matches) to users.
- **Tech**: NestJS, Firebase Cloud Messaging, RabbitMQ

---

## Communication

- **HTTP**: Used for synchronous communication (API Gateway → Services).
- **RabbitMQ**: Used for asynchronous, event-driven communication (e.g., Message Service emits an event to Notification Service when a new message is sent).

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- Yarn or npm
- MongoDB
- RabbitMQ
- (Optional) Firebase account for push notifications

### Environment Variables

Each service requires its own `.env` file. Example variables:

```env
# Common
MONGODB_URI=mongodb://localhost:27017/fakelingo
RABBITMQ_URL=amqp://localhost:5672

# Auth Service
JWT_SECRET=your_jwt_secret

# Notification Service
FIREBASE_CREDENTIALS=./service-account.json
```

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd fakelingo-server
   ```

2. **Install dependencies for each service:**
   ```bash
   cd api-gateway && yarn install
   cd ../auth-service && yarn install
   cd ../user-service && yarn install
   cd ../message-service && yarn install
   cd ../notification-service && yarn install
   ```

3. **Start MongoDB and RabbitMQ locally.**

4. **Run all services (in separate terminals):**
   ```bash
   # Example for API Gateway
   cd api-gateway
   yarn start:dev

   # Repeat for each service
   ```

---

## How Messaging & Notification Works

- When a user sends a message, the **Message Service** emits a `notification_message` event via RabbitMQ.
- The **Notification Service** listens for this event and sends a push notification to the recipient using Firebase Cloud Messaging.

---

## Project Structure

```
fakelingo-server/
├── api-gateway/
├── auth-service/
├── user-service/
├── message-service/
├── notification-service/
```

Each folder is a standalone NestJS project with its own dependencies and configuration.

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

---

## License

MIT

---

**Diagram Reference:**  
![System Architecture](https://ibb.co/kWm8d3d)

---

If you need more details for each service or want to automate multi-service startup (e.g., with Docker Compose), let me know! 