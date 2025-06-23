import React, { useState } from 'react';
import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface ChildrenListProps {
  children: string[];
  onChildrenChange: (children: string[]) => void;
}

export const ChildrenList: React.FC<ChildrenListProps> = ({
  children,
  onChildrenChange
}) => {
  const [newChild, setNewChild] = useState('');

  const handleAddChild = () => {
    if (newChild.trim()) {
      onChildrenChange([...children, newChild.trim()]);
      setNewChild('');
    }
  };

  const handleRemoveChild = (index: number) => {
    const newChildren = children.filter((_, i) => i !== index);
    onChildrenChange(newChildren);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        ילדים
      </Typography>
      
      {children.map((child, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1
          }}
        >
          <TextField
            value={child}
            disabled
            fullWidth
            size="small"
            dir="rtl"
          />
          <IconButton
            onClick={() => handleRemoveChild(index)}
            color="error"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField
          value={newChild}
          onChange={(e) => setNewChild(e.target.value)}
          placeholder="שם הילד/ה"
          size="small"
          fullWidth
          dir="rtl"
        />
        <Button
          onClick={handleAddChild}
          variant="outlined"
          disabled={!newChild.trim()}
        >
          הוסף
        </Button>
      </Box>
    </Box>
  );
}; 