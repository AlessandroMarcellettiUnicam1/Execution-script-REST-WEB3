package com.unicam.model;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;

import org.bson.types.ObjectId;
import org.hibernate.annotations.Type;
import org.hibernate.ogm.datastore.document.options.AssociationStorage;
import org.hibernate.ogm.datastore.document.options.AssociationStorageType;
import org.hibernate.ogm.datastore.mongodb.options.AssociationDocumentStorage;
import org.hibernate.ogm.datastore.mongodb.options.AssociationDocumentStorageType;
import org.json.JSONObject;

@Entity
@AssociationStorage(AssociationStorageType.ASSOCIATION_DOCUMENT)
@AssociationDocumentStorage(AssociationDocumentStorageType.COLLECTION_PER_ASSOCIATION)
public class ContractObject {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Type(type = "objectid")
    private String id;
	private String address;
	@Lob
	private HashMap<String, String> taskIdAndName = new LinkedHashMap<String, String>();
		private String abi;
	private String bin;
	@ElementCollection(fetch = FetchType.EAGER)
	private List<String> varNames;
	@Lob
	private LinkedHashMap<String, String> taskIdAndRole = new LinkedHashMap<String, String>();
	@Lob
	private LinkedHashMap<String, Integer> taskIdAndMartsiaId = new LinkedHashMap<String, Integer>();

	
	public LinkedHashMap<String, String> getTaskIdAndRole() {
		return taskIdAndRole;
	}
	public void setTaskIdAndRole(LinkedHashMap<String, String> taskIdAndRole) {
		this.taskIdAndRole = taskIdAndRole;
	}

	public String getID() {
		return id;
	}
	public void setID(String ID) {
		this.id = ID;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}


	public HashMap<String, String> getTaskIdAndName() {
		return taskIdAndName;
	}

	public void setTaskIdAndName(HashMap<String, String> taskIdAndName) {
		this.taskIdAndName = taskIdAndName;
	}

	public String getAbi() {
		return abi;
	}
	public void setAbi(String abi) {
		this.abi = abi;
	}
	public String getBin() {
		return bin;
	}
	public void setBin(String bin) {
		this.bin = bin;
	}
	
	public List<String> getVarNames() {
		return varNames;
	}
	public void setVarNames(List<String> varNames) {
		this.varNames = varNames;
	}
	
	public ContractObject(String address, HashMap<String, String> taskIdAndName, String abi, String bin, List<String> varNames,
			LinkedHashMap<String, String> taskIdAndRole, LinkedHashMap<String, Integer> taskIdAndMartsiaId) {
		super();
		this.address = address;
		this.taskIdAndName = taskIdAndName;
		this.abi = abi;
		this.bin = bin;
		this.varNames = varNames;
		this.taskIdAndRole = taskIdAndRole;
		this.taskIdAndMartsiaId = taskIdAndMartsiaId;
	}

	public LinkedHashMap<String, Integer> getTaskIdAndMartsiaId() {
		return taskIdAndMartsiaId;
	}

	public void setTaskIdAndMartsiaId(LinkedHashMap<String, Integer> taskIdAndMartsiaId) {
		this.taskIdAndMartsiaId = taskIdAndMartsiaId;
	}



	public ContractObject() {
		super();
	}
	
	
	
	
	
}
