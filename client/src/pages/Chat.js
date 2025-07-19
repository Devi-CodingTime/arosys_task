import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../contextAPI/Socketprovider';
import { getAllUsers } from '../apis/userApi';
import { getUserChats } from '../apis/chatApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Avatar,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';

const Chat = () => {
  const socket = useSocket();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = useCallback((partnerId) => {
    if (socket) {
      socket.emit('getChatHistory', { partnerId });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on('message', (message) => {
        setMessages(prev => ({
          ...prev,
          [message.senderId]: [...(prev[message.senderId] || []), message]
        }));
      });

      socket.on('chatHistory', (history) => {
        if (selectedUser) {
          setMessages(prev => ({
            ...prev,
            [selectedUser.id]: history.map(msg => ({
              senderId: msg.sender._id,
              message: msg.content,
              senderName: msg.sender.name,
              timestamp: msg.timestamp
            }))
          }));
        }
      });

      // Add socket listeners for user connections/disconnections
      socket.on('userConnected', (users) => {
        setContacts(users.filter(u => u.id !== user.id));
      });

      return () => {
        socket.off('message');
        socket.off('chatHistory');
        socket.off('userConnected');
      };
    }
  }, [socket, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        
        const users = response?.users; 
        const filteredUsers = users.filter(u => u._id !== user.id);
        
        setAllUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allUsers.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults(allUsers); 
    }
  }, [searchQuery, allUsers]);

  useEffect(() => {
    const loadUserChats = async () => {
      try {
        const response = await getUserChats(user.id);
        if (response.success) {
          setUserChats(response.data);
          // Update contacts with chat participants
          setContacts(response.data.map(chat => ({
            id: chat.contact.id,
            name: chat.contact.name,
            email: chat.contact.email,
            lastMessage: chat.lastMessage
          })));
        }
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    };
    loadUserChats();
  }, [user.id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleUserSelect = (selectedContact) => {
    setSelectedUser(selectedContact);
    loadChatHistory(selectedContact.id);
  };

  const handleSearchUserSelect = (selectedUser) => {
    const formattedUser = {
      id: selectedUser._id,
      name: selectedUser.name,
      email: selectedUser.email
    };
    setSelectedUser(formattedUser);
    setActiveTab(0); 
    if (!contacts.find(contact => contact.id === selectedUser._id)) {
      setContacts(prev => [...prev, formattedUser]);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket && selectedUser) {
      const messageData = {
        senderId: user.id,
        receiverId: selectedUser.id,
        senderName: user.name,
        message: message.trim()
      };
      socket.emit('privateMessage', messageData);
      setMessages(prev => ({
        ...prev,
        [selectedUser.id]: [...(prev[selectedUser.id] || []), messageData]
      }));
      setMessage('');
    }
  };
  return (
    <>
    <Header/>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: 'flex', gap: 2, height: '80vh' }}>
          {/* Side Panel */}
          <Paper elevation={3} sx={{ width: 300 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Contacts" />
              <Tab label="Search" />
            </Tabs>
            
            <Box sx={{ p: 2 }}>
              {activeTab === 0 ? (
                <List>
                  {contacts.map((contact) => (
                    <ListItem 
                      button 
                      key={contact.id}
                      selected={selectedUser?.id === contact.id}
                      onClick={() => handleUserSelect(contact)}
                      sx={{
                        bgcolor: selectedUser?.id === contact.id ? 'primary.light' : 'inherit',
                        color: selectedUser?.id === contact.id ? 'primary.contrastText' : 'inherit',
                        borderRadius: 2,
                        mb: 1,
                        fontWeight: selectedUser?.id === contact.id ? 600 : 400,
                        boxShadow: selectedUser?.id === contact.id ? 2 : 0,
                        transition: 'background 0.2s'
                      }}
                    >
                      <Avatar sx={{ mr: 2, bgcolor: selectedUser?.id === contact.id ? 'primary.main' : undefined }}>
                        {contact.name}
                      </Avatar>
                      <ListItemText 
                        primary={
                          <Typography sx={{ fontWeight: selectedUser?.id === contact.id ? 600 : 400 }}>
                            {contact.name}
                          </Typography>
                        }
                        secondary={contact.lastMessage ? 
                          `${contact.lastMessage.content.substring(0, 30)}...` : 
                          'No messages yet'}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <IconButton size="small">
                          <SearchIcon />
                        </IconButton>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                    {searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <ListItem 
                          button 
                          key={user._id}
                          onClick={() => handleSearchUserSelect(user)}
                        >
                          <Avatar sx={{ mr: 2 }}>{user.name[0]}</Avatar>
                          <ListItemText 
                            primary={user.name}
                            secondary={user.email}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText 
                          primary={searchQuery ? "No users found" : "Type to search users"}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Chat Area */}
          <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
              <Typography variant="h6"> 
                {selectedUser ? `Chat with ${selectedUser.name}` : 'Select a user to chat'}
              </Typography>
            </Box>
            
            <List sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {selectedUser && messages[selectedUser.id]?.map((msg, index) => (
                <ListItem
                  key={index}
                  sx={{
                    justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1,
                      backgroundColor: msg.senderId === user.id ? 'primary.light' : 'grey.100',
                      maxWidth: '70%'
                    }}
                  >
                    <Typography variant="subtitle2" color="textSecondary">
                      {msg.senderName}
                    </Typography>
                    <Typography variant="body1">{msg.message}</Typography>
                  </Paper>
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
            
            <Divider />
            
            <Box component="form" onSubmit={sendMessage} sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  variant="outlined"
                  size="small"
                  disabled={!selectedUser}
                />
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SendIcon />}
                  disabled={!message.trim() || !selectedUser}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
      <Footer/>
    </>
  );
};

export default Chat;
