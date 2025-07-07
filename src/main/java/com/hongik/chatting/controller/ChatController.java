import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.Payload;
import com.hongik.chatting.model.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat/send") // 👉 프론트가 보내는 경로
    @SendTo("/topic/{receiverId}") // 👉 프론트가 구독하는 경로
    public ChatMessage sendMessage(@DestinationVariable Long receiverId, ChatMessage message) {
        chatService.saveMessage(message); // DB 저장
        return message;
    }
}