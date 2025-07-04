import React from "react";
import { Drawer, List, ListItemIcon, ListItemText, Toolbar, ListItemButton, Tooltip } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PeopleIcon from "@mui/icons-material/People";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import ArticleIcon from "@mui/icons-material/Article";
import BarChartIcon from "@mui/icons-material/BarChart";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Properties", icon: <HomeWorkIcon />, path: "/properties" },
  { text: "Users", icon: <PeopleIcon />, path: "/users" },
  { text: "Inquiries", icon: <QuestionAnswerIcon />, path: "/inquiries" },
  { text: "Content", icon: <ArticleIcon />, path: "/content" },
  { text: "Analytics", icon: <BarChartIcon />, path: "/analytics" },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 72,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 72,
          boxSizing: 'border-box',
          background: '#fff',
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar />
      <List>
        {navItems.map(({ text, icon, path }) => (
          <Tooltip key={text} title={text} placement="right" arrow>
            <ListItemButton
              component={Link}
              to={path}
              selected={location.pathname === path}
              sx={{
                borderRadius: 2,
                mb: 1,
                justifyContent: 'center',
                px: 0,
              }}
            >
              <ListItemIcon sx={{ color: '#00B98E', minWidth: 0 }}>{icon}</ListItemIcon>
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
}