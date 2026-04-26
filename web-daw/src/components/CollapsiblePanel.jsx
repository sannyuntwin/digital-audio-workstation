import React, { useState, useRef, useEffect } from 'react';

const panelStyle = {
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(180deg, rgba(20, 28, 42, 0.94) 0%, rgba(15, 22, 34, 0.9) 100%)',
  borderRight: '1px solid rgba(148, 163, 184, 0.2)',
  position: 'relative',
  transition: 'width 0.3s ease, min-width 0.3s ease'
};

const panelCollapsedStyle = {
  ...panelStyle,
  width: '48px',
  minWidth: '48px'
};

const leftPanelStyle = {
  ...panelStyle,
  borderRight: '1px solid rgba(148, 163, 184, 0.2)'
};

const rightPanelStyle = {
  ...panelStyle,
  borderRight: 'none',
  borderLeft: '1px solid rgba(148, 163, 184, 0.2)'
};

const headerStyle = {
  height: '38px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 12px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  fontWeight: 700,
  color: '#dbeafe',
  flexShrink: 0
};

const toggleBtnStyle = {
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  borderRadius: '4px',
  color: '#6b6b75',
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

const toggleBtnHoverStyle = {
  ...toggleBtnStyle,
  background: '#2a2a2e',
  color: '#9da2ac'
};

const resizeHandleStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '6px',
  cursor: 'col-resize',
  background: 'transparent',
  zIndex: 1000
};

const resizeHandleLeftStyle = {
  ...resizeHandleStyle,
  right: '-3px'
};

const resizeHandleRightStyle = {
  ...resizeHandleStyle,
  left: '-3px'
};

const resizeHandleHoverStyle = {
  background: 'rgba(61, 139, 65, 0.3)'
};

const bodyStyle = {
  flex: 1,
  padding: '0 10px 10px',
  overflowY: 'auto'
};

const itemContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '8px',
  padding: '8px 9px',
  marginBottom: '8px',
  background: 'rgba(15, 23, 42, 0.44)'
};

const itemNameStyle = {
  fontSize: '12px',
  color: '#eff6ff',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  flex: 1,
  minWidth: 0
};

const itemDetailStyle = {
  fontSize: '11px',
  color: '#93c5fd',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '120px'
};

const truncatedTextStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const tabContainerStyle = {
  display: 'flex',
  gap: '6px',
  padding: '8px 10px 6px',
  flexShrink: 0
};

const tabBtnStyle = (isActive) => ({
  border: isActive ? '1px solid rgba(96, 165, 250, 0.65)' : '1px solid rgba(148, 163, 184, 0.28)',
  borderRadius: '7px',
  padding: '4px 8px',
  background: isActive ? 'rgba(30, 64, 175, 0.35)' : 'rgba(15, 23, 42, 0.4)',
  color: isActive ? '#eff6ff' : '#bfdbfe',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer'
});

const CollapsiblePanel = ({
  children,
  title,
  position = 'left',
  collapsed = false,
  onToggleCollapse,
  onWidthChange,
  width = 228,
  minWidth = 200,
  maxWidth = 400,
  tabs = [],
  activeTab = null,
  onTabChange = null,
  showTabs = true
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isHoveringResize, setIsHoveringResize] = useState(false);
  const [isHoveringToggle, setIsHoveringToggle] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width);
  const panelRef = useRef(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(width);

  const handleToggleCollapse = () => {
    onToggleCollapse?.();
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = currentWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleResizeMove = (e) => {
    if (!isResizing) return;
    const deltaX = e.clientX - resizeStartX.current;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStartWidth.current + deltaX));
    setCurrentWidth(newWidth);
  };

  const handleResizeEnd = () => {
    if (!isResizing) return;
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    onWidthChange?.(currentWidth);
  };

  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = (e) => handleResizeMove(e);
      const handleMouseUp = () => handleResizeEnd();
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, currentWidth, minWidth, maxWidth]);

  const getPanelStyle = () => {
    const baseStyle = position === 'right' ? rightPanelStyle : leftPanelStyle;
    if (collapsed) {
      return panelCollapsedStyle;
    }
    return {
      ...baseStyle,
      width: `${currentWidth}px`,
      minWidth: `${currentWidth}px`
    };
  };

  const getResizeHandleStyle = () => {
    const baseStyle = position === 'right' ? resizeHandleRightStyle : resizeHandleLeftStyle;
    return isHoveringResize ? { ...baseStyle, ...resizeHandleHoverStyle } : baseStyle;
  };

  return (
    <div ref={panelRef} style={getPanelStyle()}>
      <div style={headerStyle}>
        {!collapsed && <span>{title}</span>}
        <button 
          style={isHoveringToggle ? toggleBtnHoverStyle : toggleBtnStyle}
          onClick={handleToggleCollapse}
          onMouseEnter={() => setIsHoveringToggle(true)}
          onMouseLeave={() => setIsHoveringToggle(false)}
          title={collapsed ? `Expand ${title}` : `Collapse ${title}`}
        >
          {collapsed ? (position === 'right' ? '◀' : '▶') : (position === 'right' ? '▶' : '◀')}
        </button>
      </div>
      
      {!collapsed && showTabs && tabs.length > 0 && (
        <div style={tabContainerStyle}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              style={tabBtnStyle(activeTab === tab.id)}
              onClick={() => onTabChange?.(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      
      <div style={bodyStyle}>
        {children}
      </div>
      
      {!collapsed && (
        <div 
          style={getResizeHandleStyle()}
          onMouseDown={handleResizeStart}
          onMouseEnter={() => setIsHoveringResize(true)}
          onMouseLeave={() => setIsHoveringResize(false)}
          title="Drag to resize"
        />
      )}
    </div>
  );
};

export default CollapsiblePanel;
