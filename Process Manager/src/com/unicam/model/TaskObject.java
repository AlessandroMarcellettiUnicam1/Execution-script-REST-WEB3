package com.unicam.model;

import java.util.List;

public class TaskObject {
	private String sid;
	private String name;
	private List<String> params;
	private boolean active;
	
	
	public String getSid() {
		return sid;
	}
	public void setSid(String sid) {
		this.sid = sid;
	}
	public boolean isActive() {
		return active;
	}
	public void setActive(boolean active) {
		this.active = active;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public List<String> getParams() {
		return params;
	}
	public void setParams(List<String> params) {
		this.params = params;
	}
	public TaskObject(String sid, String name, List<String> params, boolean active) {
		super();
		this.sid = sid;
		this.name = name;
		this.params = params;
		this.active = active;
	}
	
	
	
	
	
	
}
