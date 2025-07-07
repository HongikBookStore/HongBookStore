import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.hongik.chatting.model.ChatMessage;
import com.hongik.chatting.repository.MessageRepository;
import com.hongik.chatting.entity.MessageEntity;

@Service
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;

    public void saveMessage(ChatMessage chatMessage) {
        MessageEntity entity = new MessageEntity(chatMessage);
        messageRepository.save(entity);
    }
}