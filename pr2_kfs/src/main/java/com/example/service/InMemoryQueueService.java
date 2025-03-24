package com.example.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

@Service
public class InMemoryQueueService {

    private static final Logger logger = LoggerFactory.getLogger(InMemoryQueueService.class);

    private final BlockingQueue<String> queue = new LinkedBlockingQueue<>();

    public void sendMessage(String message) {
        queue.offer(message);
        logger.info("Відправлено: {}", message);
    }

    public String receiveMessage() {
        String msg = queue.poll();
        logger.info("Отримано з черги: {}", msg);
        return msg;
    }

    public boolean hasMessages() {
        return !queue.isEmpty();
    }
}
